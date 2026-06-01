import mongoose from 'mongoose';

import { EMPLOYEE_ROLES } from '../employees/employee.constants.js';
import { Employee } from '../employees/employee.model.js';
import { PerformancePeriod } from '../performance/performance-period.model.js';
import { PerformanceReview } from '../performance/performance-review.model.js';
import { MeritTransaction } from './merit-transaction.model.js';
import {
  MERIT_TRANSACTION_SOURCE_TYPES,
  MERIT_TRANSACTION_TYPES
} from './wallet.constants.js';

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureValidObjectId(id, label = 'id') {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(`Invalid ${label}.`, 400);
  }
}

function normalizePoints(points) {
  const normalized = Number(points);

  if (!Number.isFinite(normalized) || normalized === 0) {
    throw createHttpError('Points must be a non-zero number.', 400);
  }

  return Math.trunc(normalized);
}

function buildTransactionFilters(query = {}) {
  const filters = {};

  if (query.employeeId) {
    ensureValidObjectId(query.employeeId, 'employee id');
    filters.employeeId = new mongoose.Types.ObjectId(query.employeeId);
  }

  if (query.type) {
    filters.type = query.type;
  }

  return filters;
}

async function ensureEmployeeExists(employeeId) {
  ensureValidObjectId(employeeId, 'employee id');

  const employee = await Employee.findById(employeeId).lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  if (employee.role !== EMPLOYEE_ROLES.EMPLOYEE) {
    throw createHttpError('Only employee role can have a merit wallet.', 400);
  }

  return employee;
}

export async function createMeritTransaction(payload) {
  const points = normalizePoints(payload.points);
  await ensureEmployeeExists(payload.employeeId);

  const filters = {
    _id: payload.employeeId,
    role: EMPLOYEE_ROLES.EMPLOYEE
  };

  if (points < 0 || payload.requireActive !== false) {
    filters.isActive = true;
  }

  if (points < 0) {
    filters.pointBalance = { $gte: Math.abs(points) };
  }

  const employeeBeforeUpdate = await Employee.findOneAndUpdate(
    filters,
    { $inc: { pointBalance: points } },
    { returnDocument: 'before', runValidators: true }
  ).lean();

  if (!employeeBeforeUpdate) {
    const employee = await Employee.findById(payload.employeeId).lean();

    if (!employee?.isActive) {
      throw createHttpError('Inactive employees cannot move merit points.', 400);
    }

    throw createHttpError('Insufficient merit points.', 409);
  }

  const balanceBefore = employeeBeforeUpdate.pointBalance;
  const balanceAfter = balanceBefore + points;

  try {
    const transaction = await MeritTransaction.create({
      employeeId: payload.employeeId,
      type: payload.type,
      points,
      balanceBefore,
      balanceAfter,
      reason: payload.reason,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId ?? null,
      createdBy: payload.createdBy ?? null,
      metadata: payload.metadata ?? {}
    });

    return transaction.toObject();
  } catch (error) {
    await Employee.updateOne({ _id: payload.employeeId }, { $inc: { pointBalance: -points } });
    throw error;
  }
}

export async function listMeritTransactions(query = {}) {
  const filters = buildTransactionFilters(query);

  return MeritTransaction.find(filters)
    .populate('employeeId', 'name email department position pointBalance')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getEmployeeWallet(employeeId) {
  ensureValidObjectId(employeeId, 'employee id');

  const employee = await Employee.findById(employeeId)
    .select('name email department position pointBalance role isActive')
    .lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  const [summary] = await MeritTransaction.aggregate([
    { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },
    {
      $group: {
        _id: null,
        earned: {
          $sum: {
            $cond: [{ $gt: ['$points', 0] }, '$points', 0]
          }
        },
        spent: {
          $sum: {
            $cond: [{ $lt: ['$points', 0] }, { $abs: '$points' }, 0]
          }
        },
        transactions: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        earned: 1,
        spent: 1,
        transactions: 1
      }
    }
  ]);

  const recentTransactions = await MeritTransaction.find({ employeeId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    employee,
    balance: employee.pointBalance,
    summary: summary ?? {
      earned: 0,
      spent: 0,
      transactions: 0
    },
    recentTransactions
  };
}

export async function grantPerformanceReviewBonus(reviewId, createdBy = null) {
  ensureValidObjectId(reviewId, 'review id');

  const review = await PerformanceReview.findById(reviewId).lean();

  if (!review) {
    throw createHttpError('Performance review not found.', 404);
  }

  const existingTransaction = await MeritTransaction.findOne({
    sourceType: MERIT_TRANSACTION_SOURCE_TYPES.PERFORMANCE_REVIEW,
    sourceId: review._id,
    type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS
  }).lean();

  if (existingTransaction) {
    throw createHttpError('Performance bonus already granted for this review.', 409);
  }

  if (review.pointsAwarded <= 0) {
    throw createHttpError('This review has no merit points to grant.', 400);
  }

  return createMeritTransaction({
    employeeId: review.employeeId,
    type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS,
    points: review.pointsAwarded,
    reason: 'Monthly performance bonus.',
    sourceType: MERIT_TRANSACTION_SOURCE_TYPES.PERFORMANCE_REVIEW,
    sourceId: review._id,
    createdBy,
    metadata: {
      finalScore: review.finalScore,
      periodId: review.periodId
    }
  });
}

export async function grantPerformancePeriodBonuses(periodId, createdBy = null) {
  ensureValidObjectId(periodId, 'period id');

  const period = await PerformancePeriod.findById(periodId).lean();

  if (!period) {
    throw createHttpError('Performance period not found.', 404);
  }

  const reviews = await PerformanceReview.find({
    periodId,
    pointsAwarded: { $gt: 0 }
  }).lean();

  let granted = 0;
  let skipped = 0;
  const transactions = [];

  for (const review of reviews) {
    const existingTransaction = await MeritTransaction.exists({
      sourceType: MERIT_TRANSACTION_SOURCE_TYPES.PERFORMANCE_REVIEW,
      sourceId: review._id,
      type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS
    });

    if (existingTransaction) {
      skipped += 1;
      continue;
    }

    const transaction = await grantPerformanceReviewBonus(review._id, createdBy);
    transactions.push(transaction);
    granted += 1;
  }

  return {
    period,
    granted,
    skipped,
    transactions
  };
}

export async function createAdminAdjustment(payload) {
  return createMeritTransaction({
    employeeId: payload.employeeId,
    type: MERIT_TRANSACTION_TYPES.ADMIN_ADJUSTMENT,
    points: payload.points,
    reason: payload.reason ?? 'Manual merit point adjustment.',
    sourceType: MERIT_TRANSACTION_SOURCE_TYPES.ADMIN_ADJUSTMENT,
    createdBy: payload.createdBy ?? null,
    metadata: payload.metadata ?? {}
  });
}

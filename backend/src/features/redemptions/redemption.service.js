import mongoose from 'mongoose';

import { EMPLOYEE_ROLES } from '../employees/employee.constants.js';
import { Employee } from '../employees/employee.model.js';
import { Reward } from '../rewards/reward.model.js';
import {
  createMeritTransaction
} from '../wallet/wallet.service.js';
import {
  MERIT_TRANSACTION_SOURCE_TYPES,
  MERIT_TRANSACTION_TYPES
} from '../wallet/wallet.constants.js';
import { REDEMPTION_STATUS } from './redemption.constants.js';
import { Redemption } from './redemption.model.js';

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

function buildRedemptionFilters(query = {}) {
  const filters = {};

  if (query.employeeId) {
    ensureValidObjectId(query.employeeId, 'employee id');
    filters.employeeId = new mongoose.Types.ObjectId(query.employeeId);
  }

  if (query.rewardId) {
    ensureValidObjectId(query.rewardId, 'reward id');
    filters.rewardId = new mongoose.Types.ObjectId(query.rewardId);
  }

  if (query.status) {
    filters.status = query.status;
  }

  return filters;
}

async function ensureRedeemingEmployee(employeeId) {
  ensureValidObjectId(employeeId, 'employee id');

  const employee = await Employee.findById(employeeId).lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  if (employee.role !== EMPLOYEE_ROLES.EMPLOYEE) {
    throw createHttpError('Only employee role can redeem rewards.', 400);
  }

  if (!employee.isActive) {
    throw createHttpError('Inactive employees cannot redeem rewards.', 400);
  }

  return employee;
}

async function ensureRedemptionExists(redemptionId) {
  ensureValidObjectId(redemptionId, 'redemption id');

  const redemption = await Redemption.findById(redemptionId);

  if (!redemption) {
    throw createHttpError('Redemption not found.', 404);
  }

  return redemption;
}

export async function listRedemptions(query = {}) {
  const filters = buildRedemptionFilters(query);

  return Redemption.find(filters)
    .populate('employeeId', 'name email department position pointBalance')
    .populate('rewardId', 'name category costInPoints stock isActive')
    .populate('reviewedBy', 'name email role')
    .sort({ requestedAt: -1 })
    .lean();
}

export async function getRedemptionById(redemptionId) {
  ensureValidObjectId(redemptionId, 'redemption id');

  const redemption = await Redemption.findById(redemptionId)
    .populate('employeeId', 'name email department position pointBalance')
    .populate('rewardId', 'name category costInPoints stock isActive')
    .populate('reviewedBy', 'name email role')
    .lean();

  if (!redemption) {
    throw createHttpError('Redemption not found.', 404);
  }

  return redemption;
}

export async function requestRedemption(payload) {
  await ensureRedeemingEmployee(payload.employeeId);
  ensureValidObjectId(payload.rewardId, 'reward id');

  const reward = await Reward.findOneAndUpdate(
    {
      _id: payload.rewardId,
      isActive: true,
      stock: { $gt: 0 }
    },
    { $inc: { stock: -1 } },
    { returnDocument: 'before', runValidators: true }
  ).lean();

  if (!reward) {
    throw createHttpError('Reward is not available.', 409);
  }

  let redemption;

  try {
    redemption = await Redemption.create({
      employeeId: payload.employeeId,
      rewardId: reward._id,
      rewardSnapshot: {
        name: reward.name,
        category: reward.category,
        costInPoints: reward.costInPoints
      },
      pointsSpent: reward.costInPoints,
      status: REDEMPTION_STATUS.PENDING,
      requestNote: payload.requestNote ?? ''
    });

    const transaction = await createMeritTransaction({
      employeeId: payload.employeeId,
      type: MERIT_TRANSACTION_TYPES.REDEMPTION_DEBIT,
      points: -reward.costInPoints,
      reason: `Reward redemption requested: ${reward.name}.`,
      sourceType: MERIT_TRANSACTION_SOURCE_TYPES.REDEMPTION,
      sourceId: redemption._id,
      metadata: {
        rewardId: reward._id,
        rewardName: reward.name,
        status: REDEMPTION_STATUS.PENDING
      }
    });

    return {
      redemption: await getRedemptionById(redemption._id),
      transaction
    };
  } catch (error) {
    if (redemption?._id) {
      await Redemption.deleteOne({ _id: redemption._id });
    }

    await Reward.updateOne({ _id: reward._id }, { $inc: { stock: 1 } });
    throw error;
  }
}

export async function approveRedemption(redemptionId, payload = {}) {
  const redemption = await ensureRedemptionExists(redemptionId);

  if (redemption.status !== REDEMPTION_STATUS.PENDING) {
    throw createHttpError('Only pending redemptions can be approved.', 409);
  }

  redemption.status = REDEMPTION_STATUS.APPROVED;
  redemption.resolvedAt = new Date();
  redemption.reviewedBy = payload.reviewedBy ?? null;
  redemption.decisionReason = payload.decisionReason ?? 'Approved by RRHH.';

  await redemption.save();

  return getRedemptionById(redemption._id);
}

export async function rejectRedemption(redemptionId, payload = {}) {
  const redemption = await ensureRedemptionExists(redemptionId);

  if (redemption.status !== REDEMPTION_STATUS.PENDING) {
    throw createHttpError('Only pending redemptions can be rejected.', 409);
  }

  redemption.status = REDEMPTION_STATUS.REJECTED;
  redemption.resolvedAt = new Date();
  redemption.reviewedBy = payload.reviewedBy ?? null;
  redemption.decisionReason = payload.decisionReason ?? 'Rejected by RRHH.';

  await redemption.save();
  await Reward.updateOne({ _id: redemption.rewardId }, { $inc: { stock: 1 } });

  const transaction = await createMeritTransaction({
    employeeId: redemption.employeeId,
    type: MERIT_TRANSACTION_TYPES.REDEMPTION_REFUND,
    points: redemption.pointsSpent,
    reason: `Refund for rejected redemption: ${redemption.rewardSnapshot.name}.`,
    sourceType: MERIT_TRANSACTION_SOURCE_TYPES.REDEMPTION,
    sourceId: redemption._id,
    createdBy: payload.reviewedBy ?? null,
    requireActive: false,
    metadata: {
      rewardId: redemption.rewardId,
      rewardName: redemption.rewardSnapshot.name,
      status: REDEMPTION_STATUS.REJECTED
    }
  });

  return {
    redemption: await getRedemptionById(redemption._id),
    transaction
  };
}

export async function markRedemptionDelivered(redemptionId, payload = {}) {
  const redemption = await ensureRedemptionExists(redemptionId);

  if (redemption.status !== REDEMPTION_STATUS.APPROVED) {
    throw createHttpError('Only approved redemptions can be delivered.', 409);
  }

  redemption.status = REDEMPTION_STATUS.DELIVERED;
  redemption.deliveredAt = new Date();
  redemption.reviewedBy = payload.reviewedBy ?? redemption.reviewedBy;
  redemption.decisionReason = payload.decisionReason ?? redemption.decisionReason;

  await redemption.save();

  return getRedemptionById(redemption._id);
}

export async function getRedemptionSummary() {
  const summary = await Redemption.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        points: { $sum: '$pointsSpent' }
      }
    }
  ]);

  return summary.reduce(
    (result, item) => {
      result.byStatus[item._id] = {
        count: item.count,
        points: item.points
      };
      result.total.count += item.count;
      result.total.points += item.points;
      return result;
    },
    {
      total: {
        count: 0,
        points: 0
      },
      byStatus: {}
    }
  );
}

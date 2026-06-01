import mongoose from 'mongoose';

import { EMPLOYEE_ROLES } from '../employees/employee.constants.js';
import { Employee } from '../employees/employee.model.js';
import { PERFORMANCE_PERIOD_STATUS } from './performance.constants.js';
import { PerformancePeriod } from './performance-period.model.js';
import { PerformanceReview } from './performance-review.model.js';
import { calculatePerformanceResult } from './performance.scoring.js';

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

function buildPeriodLabel(month, year) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function buildReviewFilters(query) {
  const filters = {};

  if (query.employeeId) {
    ensureValidObjectId(query.employeeId, 'employee id');
    filters.employeeId = new mongoose.Types.ObjectId(query.employeeId);
  }

  if (query.periodId) {
    ensureValidObjectId(query.periodId, 'period id');
    filters.periodId = new mongoose.Types.ObjectId(query.periodId);
  }

  return filters;
}

async function ensureEmployeeCanBeReviewed(employeeId) {
  ensureValidObjectId(employeeId, 'employee id');

  const employee = await Employee.findById(employeeId).lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  if (employee.role !== EMPLOYEE_ROLES.EMPLOYEE) {
    throw createHttpError('Only employee role can receive performance reviews.', 400);
  }

  if (!employee.isActive) {
    throw createHttpError('Inactive employees cannot receive performance reviews.', 400);
  }

  return employee;
}

async function ensurePeriodExists(periodId) {
  ensureValidObjectId(periodId, 'period id');

  const period = await PerformancePeriod.findById(periodId);

  if (!period) {
    throw createHttpError('Performance period not found.', 404);
  }

  return period;
}

export async function listPerformancePeriods() {
  return PerformancePeriod.find({}).sort({ year: -1, month: -1 }).lean();
}

export async function createPerformancePeriod(payload) {
  const month = Number(payload.month);
  const year = Number(payload.year);

  try {
    const period = await PerformancePeriod.create({
      month,
      year,
      label: payload.label ?? buildPeriodLabel(month, year),
      status: payload.status ?? PERFORMANCE_PERIOD_STATUS.DRAFT
    });

    return period.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError('Performance period already exists.', 409);
    }

    throw error;
  }
}

export async function getPerformancePeriodById(periodId) {
  await ensurePeriodExists(periodId);
  return PerformancePeriod.findById(periodId).lean();
}

export async function updatePerformancePeriodStatus(periodId, status) {
  const period = await ensurePeriodExists(periodId);

  period.status = status;
  period.calculatedAt =
    status === PERFORMANCE_PERIOD_STATUS.CALCULATED ? new Date() : period.calculatedAt;
  period.closedAt = status === PERFORMANCE_PERIOD_STATUS.CLOSED ? new Date() : null;

  await period.save();
  return period.toObject();
}

export async function listPerformanceReviews(query = {}) {
  const filters = buildReviewFilters(query);

  return PerformanceReview.find(filters)
    .populate('employeeId', 'name email department position role isActive pointBalance')
    .populate('periodId', 'month year label status')
    .sort({ finalScore: -1, createdAt: -1 })
    .lean();
}

export async function getPerformanceReviewById(reviewId) {
  ensureValidObjectId(reviewId, 'review id');

  const review = await PerformanceReview.findById(reviewId)
    .populate('employeeId', 'name email department position role isActive pointBalance')
    .populate('periodId', 'month year label status')
    .lean();

  if (!review) {
    throw createHttpError('Performance review not found.', 404);
  }

  return review;
}

export async function createPerformanceReview(payload) {
  await ensureEmployeeCanBeReviewed(payload.employeeId);
  await ensurePeriodExists(payload.periodId);

  const result = calculatePerformanceResult(payload.kpis);

  try {
    const review = await PerformanceReview.create({
      employeeId: payload.employeeId,
      periodId: payload.periodId,
      kpis: result.kpis,
      finalScore: result.finalScore,
      pointsAwarded: result.pointsAwarded,
      notes: payload.notes ?? ''
    });

    return getPerformanceReviewById(review._id);
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError('Employee already has a review for this period.', 409);
    }

    throw error;
  }
}

export async function updatePerformanceReview(reviewId, payload) {
  ensureValidObjectId(reviewId, 'review id');

  const review = await PerformanceReview.findById(reviewId);

  if (!review) {
    throw createHttpError('Performance review not found.', 404);
  }

  if (payload.kpis) {
    const result = calculatePerformanceResult(payload.kpis);
    review.kpis = result.kpis;
    review.finalScore = result.finalScore;
    review.pointsAwarded = result.pointsAwarded;
  }

  if (payload.notes !== undefined) {
    review.notes = payload.notes;
  }

  await review.save();
  return getPerformanceReviewById(review._id);
}

export async function generatePeriodReviews(periodId) {
  const period = await ensurePeriodExists(periodId);
  const employees = await Employee.find({
    role: EMPLOYEE_ROLES.EMPLOYEE,
    isActive: true
  }).lean();

  const existingReviews = await PerformanceReview.find({ periodId: period._id })
    .select('employeeId')
    .lean();
  const reviewedEmployeeIds = new Set(
    existingReviews.map((review) => review.employeeId.toString())
  );

  const generatedReviews = employees
    .filter((employee) => !reviewedEmployeeIds.has(employee._id.toString()))
    .map((employee) => {
      const baseScore = 60 + Math.random() * 40;
      const kpis = {
        qualityScore: baseScore + Math.random() * 8 - 4,
        deliveryScore: baseScore + Math.random() * 10 - 5,
        bugFixRate: baseScore + Math.random() * 12 - 6,
        collaborationScore: baseScore + Math.random() * 10 - 5,
        innovationScore: baseScore + Math.random() * 14 - 7
      };
      const result = calculatePerformanceResult(kpis);

      return {
        employeeId: employee._id,
        periodId: period._id,
        kpis: result.kpis,
        finalScore: result.finalScore,
        pointsAwarded: result.pointsAwarded,
        notes: 'Generated demo performance review.'
      };
    });

  if (generatedReviews.length > 0) {
    await PerformanceReview.insertMany(generatedReviews);
  }

  period.status = PERFORMANCE_PERIOD_STATUS.CALCULATED;
  period.calculatedAt = new Date();
  await period.save();

  return {
    period: period.toObject(),
    generated: generatedReviews.length,
    skipped: existingReviews.length
  };
}

export async function getPerformanceSummary(query = {}) {
  const filters = buildReviewFilters(query);
  const [summary] = await PerformanceReview.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        reviews: { $sum: 1 },
        averageScore: { $avg: '$finalScore' },
        totalPointsAwarded: { $sum: '$pointsAwarded' },
        highestScore: { $max: '$finalScore' },
        lowestScore: { $min: '$finalScore' }
      }
    },
    {
      $project: {
        _id: 0,
        reviews: 1,
        averageScore: { $round: ['$averageScore', 2] },
        totalPointsAwarded: 1,
        highestScore: 1,
        lowestScore: 1
      }
    }
  ]);

  const topPerformers = await PerformanceReview.find(filters)
    .populate('employeeId', 'name email department position')
    .populate('periodId', 'month year label status')
    .sort({ finalScore: -1 })
    .limit(5)
    .lean();

  return {
    summary: summary ?? {
      reviews: 0,
      averageScore: 0,
      totalPointsAwarded: 0,
      highestScore: 0,
      lowestScore: 0
    },
    topPerformers
  };
}

import {
  createPerformancePeriod,
  createPerformanceReview,
  generatePeriodReviews,
  getPerformancePeriodById,
  getPerformanceReviewById,
  getPerformanceSummary,
  listPerformancePeriods,
  listPerformanceReviews,
  updatePerformancePeriodStatus,
  updatePerformanceReview
} from './performance.service.js';

export async function listPerformancePeriodsHandler(_req, res, next) {
  try {
    const periods = await listPerformancePeriods();
    res.json({ data: periods });
  } catch (error) {
    next(error);
  }
}

export async function createPerformancePeriodHandler(req, res, next) {
  try {
    const period = await createPerformancePeriod(req.body);
    res.status(201).json({ data: period });
  } catch (error) {
    next(error);
  }
}

export async function getPerformancePeriodHandler(req, res, next) {
  try {
    const period = await getPerformancePeriodById(req.params.periodId);
    res.json({ data: period });
  } catch (error) {
    next(error);
  }
}

export async function updatePerformancePeriodStatusHandler(req, res, next) {
  try {
    const period = await updatePerformancePeriodStatus(req.params.periodId, req.body.status);
    res.json({ data: period });
  } catch (error) {
    next(error);
  }
}

export async function generatePeriodReviewsHandler(req, res, next) {
  try {
    const result = await generatePeriodReviews(req.params.periodId);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function listPerformanceReviewsHandler(req, res, next) {
  try {
    const reviews = await listPerformanceReviews(req.query);
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getPerformanceReviewHandler(req, res, next) {
  try {
    const review = await getPerformanceReviewById(req.params.reviewId);
    res.json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function createPerformanceReviewHandler(req, res, next) {
  try {
    const review = await createPerformanceReview(req.body);
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function updatePerformanceReviewHandler(req, res, next) {
  try {
    const review = await updatePerformanceReview(req.params.reviewId, req.body);
    res.json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function getPerformanceSummaryHandler(req, res, next) {
  try {
    const summary = await getPerformanceSummary(req.query);
    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
}

import {
  assignSelfEvaluationPeriods,
  createPerformancePeriod,
  createPerformanceReview,
  finalizePerformanceReview,
  generatePeriodReviews,
  getPerformancePeriodById,
  getPerformanceReviewById,
  getPerformanceSummary,
  listPendingSupervisorReviews,
  listPerformancePeriods,
  listPerformanceReviews,
  submitSelfEvaluation,
  submitSupervisorEvaluation,
  updatePerformancePeriodStatus,
  updatePerformanceReview,
  updateSelfEvaluation
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

export async function assignSelfEvaluationPeriodsHandler(req, res, next) {
  try {
    const result = await assignSelfEvaluationPeriods(req.body);
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

export async function listPendingSupervisorReviewsHandler(req, res, next) {
  try {
    const reviews = await listPendingSupervisorReviews(req.query);
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

export async function submitSelfEvaluationHandler(req, res, next) {
  try {
    const review = await submitSelfEvaluation(req.body);
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function updateSelfEvaluationHandler(req, res, next) {
  try {
    const review = await updateSelfEvaluation(req.params.reviewId, req.body);
    res.json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function submitSupervisorEvaluationHandler(req, res, next) {
  try {
    const review = await submitSupervisorEvaluation(req.params.reviewId, req.body);
    res.json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function finalizePerformanceReviewHandler(req, res, next) {
  try {
    const review = await finalizePerformanceReview(req.params.reviewId, req.body);
    res.json({ data: review });
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

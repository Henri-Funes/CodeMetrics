import { Router } from 'express';

import {
  createPerformancePeriodHandler,
  createPerformanceReviewHandler,
  finalizePerformanceReviewHandler,
  generatePeriodReviewsHandler,
  getPerformancePeriodHandler,
  getPerformanceReviewHandler,
  getPerformanceSummaryHandler,
  listPendingSupervisorReviewsHandler,
  listPerformancePeriodsHandler,
  listPerformanceReviewsHandler,
  submitSelfEvaluationHandler,
  submitSupervisorEvaluationHandler,
  updatePerformancePeriodStatusHandler,
  updatePerformanceReviewHandler,
  updateSelfEvaluationHandler
} from './performance.controller.js';

export const performanceRoutes = Router();

performanceRoutes.get('/periods', listPerformancePeriodsHandler);
performanceRoutes.post('/periods', createPerformancePeriodHandler);
performanceRoutes.get('/periods/:periodId', getPerformancePeriodHandler);
performanceRoutes.patch('/periods/:periodId/status', updatePerformancePeriodStatusHandler);
performanceRoutes.post('/periods/:periodId/reviews/generate', generatePeriodReviewsHandler);

performanceRoutes.get('/reviews', listPerformanceReviewsHandler);
performanceRoutes.get('/reviews/summary', getPerformanceSummaryHandler);
performanceRoutes.get('/reviews/pending-supervisor', listPendingSupervisorReviewsHandler);
performanceRoutes.get('/reviews/:reviewId', getPerformanceReviewHandler);
performanceRoutes.post('/reviews', createPerformanceReviewHandler);
performanceRoutes.post('/reviews/self-evaluations', submitSelfEvaluationHandler);
performanceRoutes.patch('/reviews/:reviewId', updatePerformanceReviewHandler);
performanceRoutes.patch('/reviews/:reviewId/self-evaluation', updateSelfEvaluationHandler);
performanceRoutes.patch('/reviews/:reviewId/supervisor-evaluation', submitSupervisorEvaluationHandler);
performanceRoutes.post('/reviews/:reviewId/finalize', finalizePerformanceReviewHandler);

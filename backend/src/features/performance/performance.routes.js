import { Router } from 'express';

import {
  createPerformancePeriodHandler,
  createPerformanceReviewHandler,
  generatePeriodReviewsHandler,
  getPerformancePeriodHandler,
  getPerformanceReviewHandler,
  getPerformanceSummaryHandler,
  listPerformancePeriodsHandler,
  listPerformanceReviewsHandler,
  updatePerformancePeriodStatusHandler,
  updatePerformanceReviewHandler
} from './performance.controller.js';

export const performanceRoutes = Router();

performanceRoutes.get('/periods', listPerformancePeriodsHandler);
performanceRoutes.post('/periods', createPerformancePeriodHandler);
performanceRoutes.get('/periods/:periodId', getPerformancePeriodHandler);
performanceRoutes.patch('/periods/:periodId/status', updatePerformancePeriodStatusHandler);
performanceRoutes.post('/periods/:periodId/reviews/generate', generatePeriodReviewsHandler);

performanceRoutes.get('/reviews', listPerformanceReviewsHandler);
performanceRoutes.get('/reviews/summary', getPerformanceSummaryHandler);
performanceRoutes.get('/reviews/:reviewId', getPerformanceReviewHandler);
performanceRoutes.post('/reviews', createPerformanceReviewHandler);
performanceRoutes.patch('/reviews/:reviewId', updatePerformanceReviewHandler);

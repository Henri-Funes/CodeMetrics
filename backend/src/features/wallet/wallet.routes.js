import { Router } from 'express';

import {
  createAdminAdjustmentHandler,
  getEmployeeWalletHandler,
  grantPerformancePeriodBonusesHandler,
  grantPerformanceReviewBonusHandler,
  listEmployeeMeritTransactionsHandler,
  listMeritTransactionsHandler
} from './wallet.controller.js';

export const walletRoutes = Router();

walletRoutes.get('/transactions', listMeritTransactionsHandler);
walletRoutes.get('/employees/:employeeId', getEmployeeWalletHandler);
walletRoutes.get('/employees/:employeeId/transactions', listEmployeeMeritTransactionsHandler);
walletRoutes.post('/adjustments', createAdminAdjustmentHandler);
walletRoutes.post('/performance-reviews/:reviewId/grant-bonus', grantPerformanceReviewBonusHandler);
walletRoutes.post('/performance-periods/:periodId/grant-bonuses', grantPerformancePeriodBonusesHandler);

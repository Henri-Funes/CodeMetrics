import { Router } from 'express';

import {
  approveRedemptionHandler,
  deliverRedemptionHandler,
  getRedemptionHandler,
  getRedemptionSummaryHandler,
  listEmployeeRedemptionsHandler,
  listRedemptionsHandler,
  rejectRedemptionHandler,
  requestRedemptionHandler
} from './redemption.controller.js';

export const redemptionRoutes = Router();

redemptionRoutes.get('/', listRedemptionsHandler);
redemptionRoutes.get('/summary', getRedemptionSummaryHandler);
redemptionRoutes.get('/employees/:employeeId', listEmployeeRedemptionsHandler);
redemptionRoutes.get('/:redemptionId', getRedemptionHandler);
redemptionRoutes.post('/', requestRedemptionHandler);
redemptionRoutes.patch('/:redemptionId/approve', approveRedemptionHandler);
redemptionRoutes.patch('/:redemptionId/reject', rejectRedemptionHandler);
redemptionRoutes.patch('/:redemptionId/deliver', deliverRedemptionHandler);

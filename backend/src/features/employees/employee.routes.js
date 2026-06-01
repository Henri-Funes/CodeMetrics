import { Router } from 'express';

import {
  activateEmployeeHandler,
  createEmployeeHandler,
  deactivateEmployeeHandler,
  getEmployeeHandler,
  getEmployeeSummaryHandler,
  listEmployeesHandler,
  updateEmployeeHandler
} from './employee.controller.js';

export const employeeRoutes = Router();

employeeRoutes.get('/', listEmployeesHandler);
employeeRoutes.get('/summary', getEmployeeSummaryHandler);
employeeRoutes.get('/:employeeId', getEmployeeHandler);
employeeRoutes.post('/', createEmployeeHandler);
employeeRoutes.patch('/:employeeId', updateEmployeeHandler);
employeeRoutes.patch('/:employeeId/activate', activateEmployeeHandler);
employeeRoutes.patch('/:employeeId/deactivate', deactivateEmployeeHandler);

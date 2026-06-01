import {
  createEmployee,
  getEmployeeById,
  getEmployeeSummary,
  listEmployees,
  setEmployeeActiveStatus,
  updateEmployee
} from './employee.service.js';

export async function listEmployeesHandler(req, res, next) {
  try {
    const employees = await listEmployees(req.query);
    res.json({ data: employees });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeHandler(req, res, next) {
  try {
    const employee = await getEmployeeById(req.params.employeeId);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function createEmployeeHandler(req, res, next) {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployeeHandler(req, res, next) {
  try {
    const employee = await updateEmployee(req.params.employeeId, req.body);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function activateEmployeeHandler(req, res, next) {
  try {
    const employee = await setEmployeeActiveStatus(req.params.employeeId, true);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function deactivateEmployeeHandler(req, res, next) {
  try {
    const employee = await setEmployeeActiveStatus(req.params.employeeId, false);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeSummaryHandler(_req, res, next) {
  try {
    const summary = await getEmployeeSummary();
    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
}

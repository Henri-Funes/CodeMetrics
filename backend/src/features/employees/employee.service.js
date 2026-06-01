import mongoose from 'mongoose';

import { Employee } from './employee.model.js';

const editableFields = ['name', 'email', 'role', 'department', 'position', 'isActive'];

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ensureValidObjectId(employeeId) {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw createHttpError('Invalid employee id.', 400);
  }
}

function pickEditableFields(payload) {
  return editableFields.reduce((fields, key) => {
    if (payload[key] !== undefined) {
      fields[key] = payload[key];
    }

    return fields;
  }, {});
}

function buildEmployeeFilters(query) {
  const filters = {};

  if (query.role) {
    filters.role = query.role;
  }

  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === 'true';
  }

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  return filters;
}

export async function listEmployees(query = {}) {
  const filters = buildEmployeeFilters(query);

  return Employee.find(filters).sort({ role: 1, name: 1 }).lean();
}

export async function getEmployeeById(employeeId) {
  ensureValidObjectId(employeeId);

  const employee = await Employee.findById(employeeId).lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  return employee;
}

export async function createEmployee(payload) {
  try {
    const employee = await Employee.create(payload);
    return employee.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError('Employee email already exists.', 409);
    }

    throw error;
  }
}

export async function updateEmployee(employeeId, payload) {
  ensureValidObjectId(employeeId);

  const fields = pickEditableFields(payload);

  const employee = await Employee.findByIdAndUpdate(employeeId, fields, {
    returnDocument: 'after',
    runValidators: true
  }).lean();

  if (!employee) {
    throw createHttpError('Employee not found.', 404);
  }

  return employee;
}

export async function setEmployeeActiveStatus(employeeId, isActive) {
  return updateEmployee(employeeId, { isActive });
}

export async function getEmployeeSummary() {
  const [summary] = await Employee.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        admins: {
          $sum: {
            $cond: [{ $eq: ['$role', 'admin'] }, 1, 0]
          }
        },
        employees: {
          $sum: {
            $cond: [{ $eq: ['$role', 'employee'] }, 1, 0]
          }
        },
        totalPointBalance: { $sum: '$pointBalance' }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        active: 1,
        inactive: { $subtract: ['$total', '$active'] },
        admins: 1,
        employees: 1,
        totalPointBalance: 1
      }
    }
  ]);

  return (
    summary ?? {
      total: 0,
      active: 0,
      inactive: 0,
      admins: 0,
      employees: 0,
      totalPointBalance: 0
    }
  );
}

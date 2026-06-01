import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { EMPLOYEE_ROLES } from '../../src/features/employees/employee.constants.js';
import {
  createEmployee as createEmployeeService,
  getEmployeeSummary,
  listEmployees,
  setEmployeeActiveStatus,
  updateEmployee
} from '../../src/features/employees/employee.service.js';
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from '../utils/test-db.js';
import { employeePayload } from '../utils/factories.js';

describe('Employees integration', () => {
  before(connectTestDatabase);
  beforeEach(resetTestDatabase);
  after(disconnectTestDatabase);

  it('creates, lists and updates employees', async () => {
    const created = await createEmployeeService(employeePayload());

    const listed = await listEmployees({ role: EMPLOYEE_ROLES.EMPLOYEE });
    const updated = await updateEmployee(created._id, {
      department: 'Infraestructura',
      position: 'DevOps Engineer'
    });

    assert.equal(listed.length, 1);
    assert.equal(updated.department, 'Infraestructura');
    assert.equal(updated.position, 'DevOps Engineer');
  });

  it('activates, deactivates and summarizes employees', async () => {
    const employee = await createEmployeeService(employeePayload());

    await setEmployeeActiveStatus(employee._id, false);
    const summary = await getEmployeeSummary();
    const inactive = await listEmployees({ isActive: 'false' });

    assert.equal(summary.total, 1);
    assert.equal(summary.inactive, 1);
    assert.equal(inactive.length, 1);
  });
});

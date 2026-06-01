import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EMPLOYEE_ROLES } from '../../src/features/employees/employee.constants.js';
import { Employee } from '../../src/features/employees/employee.model.js';

describe('Employee model', () => {
  it('normalizes email and applies defaults', async () => {
    const employee = new Employee({
      name: 'Ada Developer',
      email: 'ADA.DEV@CODEMETRICS.TEST',
      department: 'Desarrollo',
      position: 'Backend Developer'
    });

    await employee.validate();

    assert.equal(employee.email, 'ada.dev@codemetrics.test');
    assert.equal(employee.role, EMPLOYEE_ROLES.EMPLOYEE);
    assert.equal(employee.pointBalance, 0);
    assert.equal(employee.isActive, true);
  });

  it('rejects unknown roles', async () => {
    const employee = new Employee({
      name: 'Bad Role',
      email: 'bad-role@codemetrics.test',
      role: 'manager',
      department: 'Desarrollo',
      position: 'Backend Developer'
    });

    await assert.rejects(() => employee.validate(), /`manager` is not a valid enum value/);
  });
});

import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { Employee } from '../../src/features/employees/employee.model.js';
import {
  createAdminAdjustment,
  getEmployeeWallet,
  grantPerformanceReviewBonus
} from '../../src/features/wallet/wallet.service.js';
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from '../utils/test-db.js';
import {
  createAdmin,
  createEmployee,
  createPerformancePeriod,
  createPerformanceReview,
  kpiPayload
} from '../utils/factories.js';

describe('Wallet integration', () => {
  before(connectTestDatabase);
  beforeEach(resetTestDatabase);
  after(disconnectTestDatabase);

  it('grants performance bonus and prevents duplicate grants', async () => {
    const employee = await createEmployee();
    const admin = await createAdmin();
    const period = await createPerformancePeriod();
    const review = await createPerformanceReview(employee._id, period._id, {
      kpis: kpiPayload({ qualityScore: 100, deliveryScore: 100, bugFixRate: 100 })
    });

    const transaction = await grantPerformanceReviewBonus(review._id, admin._id);
    const wallet = await getEmployeeWallet(employee._id);

    assert.equal(transaction.type, 'performance_bonus');
    assert.equal(wallet.balance, transaction.points);
    await assert.rejects(() => grantPerformanceReviewBonus(review._id, admin._id), /already granted/);
  });

  it('creates positive and negative admin adjustments safely', async () => {
    const employee = await createEmployee();
    const admin = await createAdmin();

    await createAdminAdjustment({
      employeeId: employee._id,
      points: 500,
      reason: 'Initial test adjustment.',
      createdBy: admin._id
    });
    await createAdminAdjustment({
      employeeId: employee._id,
      points: -200,
      reason: 'Negative test adjustment.',
      createdBy: admin._id
    });

    const updated = await Employee.findById(employee._id).lean();

    assert.equal(updated.pointBalance, 300);
    await assert.rejects(
      () =>
        createAdminAdjustment({
          employeeId: employee._id,
          points: -1000,
          reason: 'Too much debit.',
          createdBy: admin._id
        }),
      /Insufficient merit points/
    );
  });
});

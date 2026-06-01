import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { Employee } from '../../src/features/employees/employee.model.js';
import { Reward } from '../../src/features/rewards/reward.model.js';
import {
  approveRedemption,
  getRedemptionSummary,
  markRedemptionDelivered,
  rejectRedemption,
  requestRedemption
} from '../../src/features/redemptions/redemption.service.js';
import { createAdminAdjustment } from '../../src/features/wallet/wallet.service.js';
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from '../utils/test-db.js';
import { createAdmin, createEmployee, createReward } from '../utils/factories.js';

describe('Redemptions integration', () => {
  before(connectTestDatabase);
  beforeEach(resetTestDatabase);
  after(disconnectTestDatabase);

  async function createFundedEmployee(points = 2000) {
    const employee = await createEmployee();
    const admin = await createAdmin();

    await createAdminAdjustment({
      employeeId: employee._id,
      points,
      reason: 'Test funding.',
      createdBy: admin._id
    });

    return { employee, admin };
  }

  it('requests a redemption and debits wallet plus stock', async () => {
    const { employee } = await createFundedEmployee();
    const reward = await createReward({ costInPoints: 500, stock: 2 });

    const result = await requestRedemption({
      employeeId: employee._id,
      rewardId: reward._id,
      requestNote: 'Integration test.'
    });
    const updatedEmployee = await Employee.findById(employee._id).lean();
    const updatedReward = await Reward.findById(reward._id).lean();

    assert.equal(result.redemption.status, 'pending');
    assert.equal(result.transaction.type, 'redemption_debit');
    assert.equal(updatedEmployee.pointBalance, 1500);
    assert.equal(updatedReward.stock, 1);
  });

  it('approves and delivers a redemption', async () => {
    const { employee, admin } = await createFundedEmployee();
    const reward = await createReward({ costInPoints: 500, stock: 2 });
    const requested = await requestRedemption({
      employeeId: employee._id,
      rewardId: reward._id
    });

    const approved = await approveRedemption(requested.redemption._id, {
      reviewedBy: admin._id,
      decisionReason: 'Approved in test.'
    });
    const delivered = await markRedemptionDelivered(approved._id, {
      reviewedBy: admin._id
    });

    assert.equal(approved.status, 'approved');
    assert.equal(delivered.status, 'delivered');
  });

  it('rejects a redemption and refunds wallet plus stock', async () => {
    const { employee, admin } = await createFundedEmployee();
    const reward = await createReward({ costInPoints: 500, stock: 2 });
    const requested = await requestRedemption({
      employeeId: employee._id,
      rewardId: reward._id
    });

    const rejected = await rejectRedemption(requested.redemption._id, {
      reviewedBy: admin._id,
      decisionReason: 'Rejected in test.'
    });
    const updatedEmployee = await Employee.findById(employee._id).lean();
    const updatedReward = await Reward.findById(reward._id).lean();
    const summary = await getRedemptionSummary();

    assert.equal(rejected.redemption.status, 'rejected');
    assert.equal(rejected.transaction.type, 'redemption_refund');
    assert.equal(updatedEmployee.pointBalance, 2000);
    assert.equal(updatedReward.stock, 2);
    assert.equal(summary.byStatus.rejected.count, 1);
  });
});

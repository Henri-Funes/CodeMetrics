import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mongoose from 'mongoose';

import { REDEMPTION_STATUS } from '../../src/features/redemptions/redemption.constants.js';
import { Redemption } from '../../src/features/redemptions/redemption.model.js';

describe('Redemption model', () => {
  it('creates pending redemption tickets by default', async () => {
    const redemption = new Redemption({
      employeeId: new mongoose.Types.ObjectId(),
      rewardId: new mongoose.Types.ObjectId(),
      rewardSnapshot: {
        name: 'Dia Libre',
        category: 'time',
        costInPoints: 1600
      },
      pointsSpent: 1600
    });

    await redemption.validate();

    assert.equal(redemption.status, REDEMPTION_STATUS.PENDING);
    assert.ok(redemption.requestedAt);
  });

  it('requires reward snapshot data', async () => {
    const redemption = new Redemption({
      employeeId: new mongoose.Types.ObjectId(),
      rewardId: new mongoose.Types.ObjectId(),
      pointsSpent: 1600
    });

    await assert.rejects(() => redemption.validate(), /rewardSnapshot/);
  });
});

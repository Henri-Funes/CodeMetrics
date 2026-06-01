import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mongoose from 'mongoose';

import { MeritTransaction } from '../../src/features/wallet/merit-transaction.model.js';
import {
  MERIT_TRANSACTION_SOURCE_TYPES,
  MERIT_TRANSACTION_TYPES
} from '../../src/features/wallet/wallet.constants.js';

describe('MeritTransaction model', () => {
  it('validates a complete wallet transaction', async () => {
    const employeeId = new mongoose.Types.ObjectId();
    const transaction = new MeritTransaction({
      employeeId,
      type: MERIT_TRANSACTION_TYPES.PERFORMANCE_BONUS,
      points: 800,
      balanceBefore: 100,
      balanceAfter: 900,
      reason: 'Monthly bonus.',
      sourceType: MERIT_TRANSACTION_SOURCE_TYPES.PERFORMANCE_REVIEW,
      sourceId: new mongoose.Types.ObjectId()
    });

    await transaction.validate();

    assert.equal(transaction.balanceAfter, 900);
  });

  it('rejects unknown transaction types', async () => {
    const transaction = new MeritTransaction({
      employeeId: new mongoose.Types.ObjectId(),
      type: 'bonus',
      points: 10,
      balanceBefore: 0,
      balanceAfter: 10,
      reason: 'Invalid type.',
      sourceType: MERIT_TRANSACTION_SOURCE_TYPES.SEED
    });

    await assert.rejects(() => transaction.validate(), /`bonus` is not a valid enum value/);
  });
});

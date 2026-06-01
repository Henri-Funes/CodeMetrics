import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REWARD_CATEGORIES } from '../../src/features/rewards/reward.constants.js';
import { Reward } from '../../src/features/rewards/reward.model.js';

describe('Reward model', () => {
  it('applies defaults for active catalog rewards', async () => {
    const reward = new Reward({
      name: 'Viernes Corto',
      description: 'Salida a mediodia.',
      costInPoints: 800,
      stock: 10
    });

    await reward.validate();

    assert.equal(reward.category, REWARD_CATEGORIES.LICENSES);
    assert.equal(reward.isActive, true);
  });

  it('rejects rewards without positive cost', async () => {
    const reward = new Reward({
      name: 'Invalid Reward',
      description: 'No cost.',
      category: REWARD_CATEGORIES.TIME,
      costInPoints: 0,
      stock: 1
    });

    await assert.rejects(() => reward.validate(), /less than minimum allowed value/);
  });
});

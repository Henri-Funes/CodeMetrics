import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import { REWARD_CATEGORIES } from '../../src/features/rewards/reward.constants.js';
import {
  createReward,
  listRewardCatalog,
  listRewards,
  setRewardActiveStatus,
  updateReward
} from '../../src/features/rewards/reward.service.js';
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from '../utils/test-db.js';
import { rewardPayload } from '../utils/factories.js';

describe('Rewards integration', () => {
  before(connectTestDatabase);
  beforeEach(resetTestDatabase);
  after(disconnectTestDatabase);

  it('creates, lists and updates rewards', async () => {
    const reward = await createReward(
      rewardPayload({
        category: REWARD_CATEGORIES.TIME,
        costInPoints: 800
      })
    );

    const updated = await updateReward(reward._id, { costInPoints: 900 });
    const listed = await listRewards({ includeInactive: 'true' });

    assert.equal(updated.costInPoints, 900);
    assert.equal(listed.length, 1);
  });

  it('filters catalog by active and available rewards', async () => {
    await createReward(rewardPayload({ name: 'Active Reward', stock: 2 }));
    const inactive = await createReward(rewardPayload({ name: 'Inactive Reward', stock: 2 }));
    await setRewardActiveStatus(inactive._id, false);

    const catalog = await listRewardCatalog();

    assert.equal(catalog.length, 1);
    assert.equal(catalog[0].name, 'Active Reward');
  });
});

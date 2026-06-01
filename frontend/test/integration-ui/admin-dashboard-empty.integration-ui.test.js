import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAdminDashboardSnapshot } from '../../src/features/admin/models/adminDashboardSnapshot.model.js';

describe('admin dashboard empty integration-ui', () => {
  it('returns safe defaults for missing data', () => {
    const snapshot = buildAdminDashboardSnapshot({});

    assert.equal(snapshot.employees.total, 0);
    assert.equal(snapshot.performance.reviews, 0);
    assert.equal(snapshot.performance.topPerformers.length, 0);
    assert.equal(snapshot.redemptions.totalCount, 0);
    assert.equal(snapshot.redemptions.byStatus.length, 0);
  });
});

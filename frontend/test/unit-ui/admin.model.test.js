import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toRedemptionSummaryRows, toTopPerformerRows } from '../../src/features/admin/models/admin.model.js';

describe('admin.model unit', () => {
  it('maps top performers to table rows', () => {
    const rows = toTopPerformerRows([
      {
        _id: 'review-1',
        employeeId: { name: 'Ana Dev', department: 'Backend' },
        periodId: { label: '2026-05' },
        finalScore: 95.5,
        pointsAwarded: 1000
      }
    ]);

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, 'Ana Dev');
    assert.equal(rows[0].department, 'Backend');
    assert.equal(rows[0].period, '2026-05');
    assert.equal(rows[0].score, 95.5);
    assert.equal(rows[0].pointsAwarded, 1000);
  });

  it('maps redemption summary entries', () => {
    const rows = toRedemptionSummaryRows({
      byStatus: {
        pending: { count: 3, points: 2500 },
        delivered: { count: 5, points: 4200 }
      }
    });

    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0], {
      key: 'pending',
      status: 'pending',
      count: 3,
      points: 2500
    });
  });
});

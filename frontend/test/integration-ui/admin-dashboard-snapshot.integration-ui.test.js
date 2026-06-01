import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAdminDashboardSnapshot } from '../../src/features/admin/models/adminDashboardSnapshot.model.js';

describe('admin dashboard snapshot integration-ui', () => {
  it('builds a coherent snapshot from multiple summaries', () => {
    const snapshot = buildAdminDashboardSnapshot({
      employeeSummary: {
        total: 103,
        active: 99,
        inactive: 4
      },
      performanceSummary: {
        summary: {
          reviews: 98,
          averageScore: 84.22,
          totalPointsAwarded: 61200
        },
        topPerformers: [
          {
            _id: 'review-1',
            employeeId: { name: 'Carlos', department: 'Infra' },
            periodId: { label: '2026-05' },
            finalScore: 96.1,
            pointsAwarded: 1000
          }
        ]
      },
      redemptionSummary: {
        total: { count: 12, points: 8900 },
        byStatus: {
          pending: { count: 2, points: 1400 },
          delivered: { count: 8, points: 6200 }
        }
      }
    });

    assert.equal(snapshot.employees.total, 103);
    assert.equal(snapshot.performance.reviews, 98);
    assert.equal(snapshot.performance.topPerformers.length, 1);
    assert.equal(snapshot.redemptions.totalCount, 12);
    assert.equal(snapshot.redemptions.byStatus.length, 2);
  });
});

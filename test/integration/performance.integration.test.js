import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import {
  createPerformancePeriod,
  createPerformanceReview,
  generatePeriodReviews,
  getPerformanceSummary,
  listPerformanceReviews
} from '../../src/features/performance/performance.service.js';
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from '../utils/test-db.js';
import { createEmployee, createPerformancePeriod as createPeriodModel, kpiPayload } from '../utils/factories.js';

describe('Performance integration', () => {
  before(connectTestDatabase);
  beforeEach(resetTestDatabase);
  after(disconnectTestDatabase);

  it('creates a period and review with calculated score and points', async () => {
    const employee = await createEmployee();
    const period = await createPerformancePeriod({ month: 5, year: 2026 });
    const review = await createPerformanceReview({
      employeeId: employee._id,
      periodId: period._id,
      kpis: kpiPayload({ qualityScore: 95, deliveryScore: 95, bugFixRate: 95 })
    });

    const summary = await getPerformanceSummary({ periodId: period._id.toString() });

    assert.equal(review.finalScore > 0, true);
    assert.equal(review.pointsAwarded >= 600, true);
    assert.equal(summary.summary.reviews, 1);
  });

  it('generates missing reviews for active employees', async () => {
    await createEmployee();
    await createEmployee();
    const period = await createPeriodModel({ month: 6, year: 2026, label: '2026-06' });

    const result = await generatePeriodReviews(period._id);
    const reviews = await listPerformanceReviews({ periodId: period._id.toString() });

    assert.equal(result.generated, 2);
    assert.equal(reviews.length, 2);
  });
});

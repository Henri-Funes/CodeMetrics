import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  calculateFinalScore,
  calculatePerformanceResult,
  calculatePointsAwarded,
  normalizeKpis
} from '../../src/features/performance/performance.scoring.js';

describe('Performance scoring', () => {
  it('calculates weighted final score', () => {
    const finalScore = calculateFinalScore({
      qualityScore: 100,
      deliveryScore: 80,
      bugFixRate: 70,
      collaborationScore: 90,
      innovationScore: 60
    });

    assert.equal(finalScore, 83.5);
  });

  it('normalizes KPI values and maps points', () => {
    const result = calculatePerformanceResult({
      qualityScore: 120,
      deliveryScore: 90,
      bugFixRate: -10,
      collaborationScore: 100,
      innovationScore: 100
    });

    assert.deepEqual(normalizeKpis(result.kpis), result.kpis);
    assert.equal(result.kpis.qualityScore, 100);
    assert.equal(result.kpis.bugFixRate, 0);
    assert.equal(calculatePointsAwarded(95), 1000);
    assert.equal(calculatePointsAwarded(89.9), 600);
    assert.equal(calculatePointsAwarded(59.9), 0);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDate, formatPoints, formatScore } from '../../src/shared/utils/formatters.js';

describe('formatters unit', () => {
  it('formats points in es-MX style', () => {
    assert.equal(formatPoints(1200), '1,200 pts');
  });

  it('formats score with two decimals', () => {
    assert.equal(formatScore(87.345), '87.34');
    assert.equal(formatScore(undefined), '0.00');
  });

  it('formats invalid date safely', () => {
    assert.equal(formatDate(''), '-');
    assert.equal(formatDate('invalid'), '-');
  });
});

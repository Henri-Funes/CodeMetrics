import { KPI_FIELDS, KPI_WEIGHTS } from './performance.constants.js';

function toScore(value) {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.min(Math.max(score, 0), 100);
}

export function normalizeKpis(kpis = {}) {
  return KPI_FIELDS.reduce((normalized, field) => {
    normalized[field] = toScore(kpis[field]);
    return normalized;
  }, {});
}

export function calculateFinalScore(kpis = {}) {
  const normalizedKpis = normalizeKpis(kpis);
  const weightedScore = KPI_FIELDS.reduce(
    (total, field) => total + normalizedKpis[field] * KPI_WEIGHTS[field],
    0
  );

  return Math.round(weightedScore * 100) / 100;
}

export function calculatePointsAwarded(finalScore) {
  if (finalScore >= 95) return 1000;
  if (finalScore >= 90) return 800;
  if (finalScore >= 80) return 600;
  if (finalScore >= 70) return 350;
  if (finalScore >= 60) return 150;

  return 0;
}

export function calculatePerformanceResult(kpis = {}) {
  const normalizedKpis = normalizeKpis(kpis);
  const finalScore = calculateFinalScore(normalizedKpis);
  const pointsAwarded = calculatePointsAwarded(finalScore);

  return {
    kpis: normalizedKpis,
    finalScore,
    pointsAwarded
  };
}

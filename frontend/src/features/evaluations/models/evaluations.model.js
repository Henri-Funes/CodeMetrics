export const EVALUATION_STATUS = {
  DRAFT: 'draft',
  SELF_SUBMITTED: 'self_submitted',
  SUPERVISOR_REVIEWED: 'supervisor_reviewed',
  FINALIZED: 'finalized'
};

export const evaluationStatusOptions = [
  { value: EVALUATION_STATUS.DRAFT, label: 'Borrador' },
  { value: EVALUATION_STATUS.SELF_SUBMITTED, label: 'Autoevaluada' },
  { value: EVALUATION_STATUS.SUPERVISOR_REVIEWED, label: 'Revisada' },
  { value: EVALUATION_STATUS.FINALIZED, label: 'Finalizada' }
];

export const evaluationStatusColor = {
  [EVALUATION_STATUS.DRAFT]: 'default',
  [EVALUATION_STATUS.SELF_SUBMITTED]: 'gold',
  [EVALUATION_STATUS.SUPERVISOR_REVIEWED]: 'processing',
  [EVALUATION_STATUS.FINALIZED]: 'success'
};

export const evaluationKpis = [
  { key: 'qualityScore', label: 'Calidad', weight: 0.3, color: '#00e5ff' },
  { key: 'deliveryScore', label: 'Entrega', weight: 0.25, color: '#1dd1a1' },
  { key: 'bugFixRate', label: 'Correccion de bugs', weight: 0.2, color: '#feca57' },
  { key: 'collaborationScore', label: 'Colaboracion', weight: 0.15, color: '#a29bfe' },
  { key: 'innovationScore', label: 'Innovacion', weight: 0.1, color: '#ff6b6b' }
];

const statusLabelByValue = Object.fromEntries(
  evaluationStatusOptions.map((option) => [option.value, option.label])
);

function toNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(number, 0), 100);
}

export function getEvaluationStatusLabel(status) {
  return statusLabelByValue[status] ?? status;
}

export function calculateEvaluationPreview(kpis = {}) {
  const score = evaluationKpis.reduce((total, kpi) => total + toNumber(kpis[kpi.key]) * kpi.weight, 0);
  return Math.round(score * 100) / 100;
}

export function toEvaluationRows(reviews = []) {
  return reviews.map((review) => ({
    ...review,
    key: review._id,
    employeeName: review.employeeId?.name ?? 'Empleado',
    employeeDepartment: review.employeeId?.department ?? '-',
    employeePosition: review.employeeId?.position ?? '-',
    periodLabel: review.periodId?.label ?? 'Sin periodo',
    status: review.status ?? EVALUATION_STATUS.DRAFT,
    statusLabel: getEvaluationStatusLabel(review.status ?? EVALUATION_STATUS.DRAFT),
    finalScore: Number(review.finalScore ?? 0),
    pointsAwarded: Number(review.pointsAwarded ?? 0)
  }));
}

export function filterEvaluationsClient(reviews = [], filters = {}) {
  const normalizedSearch = String(filters.search ?? '')
    .trim()
    .toLowerCase();

  return reviews.filter((review) => {
    if (filters.status && review.status !== filters.status) return false;
    if (filters.periodId && review.periodId?._id !== filters.periodId) return false;
    if (filters.employeeId && review.employeeId?._id !== filters.employeeId) return false;

    if (!normalizedSearch) return true;

    const haystack = `${review.employeeName} ${review.employeeDepartment} ${review.employeePosition} ${
      review.periodLabel
    }`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}

export function summarizeEvaluations(reviews = []) {
  return {
    total: reviews.length,
    pendingSupervisor: reviews.filter((review) => review.status === EVALUATION_STATUS.SELF_SUBMITTED).length,
    reviewed: reviews.filter((review) => review.status === EVALUATION_STATUS.SUPERVISOR_REVIEWED).length,
    finalized: reviews.filter((review) => review.status === EVALUATION_STATUS.FINALIZED).length
  };
}

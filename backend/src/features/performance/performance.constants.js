export const PERFORMANCE_PERIOD_STATUS = {
  DRAFT: 'draft',
  CALCULATED: 'calculated',
  CLOSED: 'closed'
};

export const PERFORMANCE_PERIOD_STATUS_VALUES = Object.values(PERFORMANCE_PERIOD_STATUS);

export const PERFORMANCE_REVIEW_STATUS = {
  DRAFT: 'draft',
  SELF_SUBMITTED: 'self_submitted',
  SUPERVISOR_REVIEWED: 'supervisor_reviewed',
  FINALIZED: 'finalized'
};

export const PERFORMANCE_REVIEW_STATUS_VALUES = Object.values(PERFORMANCE_REVIEW_STATUS);

export const KPI_FIELDS = [
  'qualityScore',
  'deliveryScore',
  'bugFixRate',
  'collaborationScore',
  'innovationScore'
];

export const KPI_WEIGHTS = {
  qualityScore: 0.3,
  deliveryScore: 0.25,
  bugFixRate: 0.2,
  collaborationScore: 0.15,
  innovationScore: 0.1
};

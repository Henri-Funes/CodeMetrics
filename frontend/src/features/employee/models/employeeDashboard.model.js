export const KPI_PRESENTATION = [
  {
    key: 'qualityScore',
    label: 'Calidad',
    color: '#00e5ff'
  },
  {
    key: 'deliveryScore',
    label: 'Entrega',
    color: '#1dd1a1'
  },
  {
    key: 'bugFixRate',
    label: 'Correccion de Bugs',
    color: '#feca57'
  },
  {
    key: 'collaborationScore',
    label: 'Colaboracion',
    color: '#a29bfe'
  },
  {
    key: 'innovationScore',
    label: 'Innovacion',
    color: '#ff6b6b'
  }
];

export function getScoreStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'regular';
  return 'low';
}

export function getTimelineColorByScore(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'orange';
  return 'red';
}

export function toPerformanceHistoryTimeline(reviews = []) {
  return [...reviews]
    .sort((a, b) => {
      const periodA = a.periodId?.label ?? '';
      const periodB = b.periodId?.label ?? '';
      return periodB.localeCompare(periodA);
    })
    .map((review) => {
      const score = Number(review.finalScore ?? 0);

      return {
        key: review._id,
        period: review.periodId?.label ?? 'Sin periodo',
        score,
        pointsAwarded: Number(review.pointsAwarded ?? 0),
        color: getTimelineColorByScore(score)
      };
    });
}

export function buildEmployeeDashboardNotifications(reviews = []) {
  const notifications = [];

  const pendingDrafts = reviews.filter((review) => review.status === 'draft');
  if (pendingDrafts.length > 0) {
    const periodLabels = pendingDrafts
      .map((review) => review.periodId?.label ?? 'Sin periodo')
      .join(', ');

    notifications.push({
      key: 'pending-self-evaluations',
      type: 'warning',
      message: 'Autoevaluaciones pendientes',
      description: `Tienes ${pendingDrafts.length} autoevaluacion(es) por completar en: ${periodLabels}.`
    });
  }

  const submitted = reviews.filter((review) => review.status === 'self_submitted');
  if (submitted.length > 0) {
    const periodLabels = submitted
      .map((review) => review.periodId?.label ?? 'Sin periodo')
      .join(', ');

    notifications.push({
      key: 'submitted-self-evaluations',
      type: 'success',
      message: 'Autoevaluacion enviada',
      description: `Tu autoevaluacion del periodo ${periodLabels} fue enviada correctamente. El supervisor la revisara pronto.`
    });
  }

  return notifications;
}

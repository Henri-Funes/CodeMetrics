export function formatPoints(value) {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat('es-MX').format(amount)} pts`;
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);
}

export function formatScore(value) {
  const score = Number(value ?? 0);
  return Number.isFinite(score) ? score.toFixed(2) : '0.00';
}

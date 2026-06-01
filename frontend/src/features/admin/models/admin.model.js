export function toTopPerformerRows(topPerformers = []) {
  return topPerformers.map((review) => ({
    key: review._id,
    name: review.employeeId?.name ?? 'Empleado',
    department: review.employeeId?.department ?? '-',
    period: review.periodId?.label ?? '-',
    score: Number(review.finalScore ?? 0),
    pointsAwarded: Number(review.pointsAwarded ?? 0)
  }));
}

export function toRedemptionSummaryRows(summary = {}) {
  const byStatus = summary.byStatus ?? {};
  return Object.entries(byStatus).map(([status, data]) => ({
    key: status,
    status,
    count: Number(data.count ?? 0),
    points: Number(data.points ?? 0)
  }));
}

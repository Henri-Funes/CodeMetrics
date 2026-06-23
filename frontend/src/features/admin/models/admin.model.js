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

export function toPeriodRows(periods = []) {
  return periods.map((period) => ({
    key: period._id,
    id: period._id,
    label: period.label ?? `${period.year}-${String(period.month).padStart(2, '0')}`,
    status: period.status ?? 'draft',
    month: period.month,
    year: period.year,
    calculatedAt: period.calculatedAt ?? null,
    closedAt: period.closedAt ?? null
  }));
}

export function filterRewardsClient(rewards, { category, availableOnly, search }) {
  const normalizedSearch = String(search ?? '')
    .trim()
    .toLowerCase();

  return rewards.filter((reward) => {
    if (category && reward.category !== category) {
      return false;
    }

    if (availableOnly === 'true' && (!reward.isActive || Number(reward.stock) <= 0)) {
      return false;
    }

    if (availableOnly === 'false' && reward.isActive && Number(reward.stock) > 0) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = `${reward.name} ${reward.description} ${reward.category}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });
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

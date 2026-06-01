import { toRedemptionSummaryRows, toTopPerformerRows } from './admin.model.js';

export function buildAdminDashboardSnapshot({
  employeeSummary = {},
  performanceSummary = {},
  redemptionSummary = {}
}) {
  const employees = {
    total: Number(employeeSummary.total ?? 0),
    active: Number(employeeSummary.active ?? 0),
    inactive: Number(employeeSummary.inactive ?? 0)
  };

  const performance = {
    reviews: Number(performanceSummary.summary?.reviews ?? 0),
    averageScore: Number(performanceSummary.summary?.averageScore ?? 0),
    totalPointsAwarded: Number(performanceSummary.summary?.totalPointsAwarded ?? 0),
    topPerformers: toTopPerformerRows(performanceSummary.topPerformers ?? [])
  };

  const redemptions = {
    totalCount: Number(redemptionSummary.total?.count ?? 0),
    totalPoints: Number(redemptionSummary.total?.points ?? 0),
    byStatus: toRedemptionSummaryRows(redemptionSummary)
  };

  return { employees, performance, redemptions };
}

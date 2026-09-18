import {
  dashboardFixture,
  dailyRevenueFixture,
  reportPeriods,
} from "../../data/mock/admin/dashboard.mock.js";

export async function getDashboard({ period = "2025-Q4", range = "30d" } = {}) {
  const selected = reportPeriods.find((item) => item.id === period);
  if (!selected || !["30d", "quarter", "ytd"].includes(range))
    throw new Error("Kỳ báo cáo hoặc khoảng thời gian không hợp lệ.");
  const start =
    range === "ytd"
      ? `${selected.end.slice(0, 4)}-01-01`
      : range === "quarter"
        ? selected.start
        : new Date(Date.parse(`${selected.end}T00:00:00Z`) - 29 * 86400000)
            .toISOString()
            .slice(0, 10);
  const series = dailyRevenueFixture.filter(
    (point) => point.date >= start && point.date <= selected.end,
  );
  const summary = dashboardFixture.reports[period];
  const peak = series.reduce(
    (best, point) => (point.value > best.value ? point : best),
    series[0],
  );
  return structuredClone({
    periods: reportPeriods,
    period: selected,
    range,
    start,
    end: selected.end,
    series,
    peak,
    seriesTotal: series.reduce((sum, point) => sum + point.value, 0),
    summary,
    profile: dashboardFixture.profile,
    distribution: dashboardFixture.distribution,
    materials: dashboardFixture.materialNames.map((name, i) => ({
      name,
      percentage: summary.materials[i],
      color: dashboardFixture.materialColors[i],
    })),
    channels: dashboardFixture.channels.map((name, i) => ({
      name,
      description: dashboardFixture.channelDescriptions[i],
      value: summary.channels[i],
    })),
    stories: dashboardFixture.stories,
    hubs: dashboardFixture.hubs,
    alerts: dashboardFixture.alerts,
  });
}

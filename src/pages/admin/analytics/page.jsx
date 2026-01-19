import { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { TEAMS, getStatsByTeam } from "@data/mockData";
import { useTranslation } from "react-i18next";
import AdminLayout from "@layouts/AdminLayout";
import MetricCard from "@ui/MetricCard";
import InfoMetricCard from "@ui/InfoMetricCard";
import PieChartComponent from "@charts/PieChartComponent";
import BarChartComponent from "@charts/BarChartComponent";
import MultiBarChartComponent from "@charts/MultiBarChartComponent";
import AgentPerformanceTable from "@tables/AgentPerformanceTable";
import FiltersSection from "@filters/FiltersSection";

export default function Analytics() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [dateFilter, setDateFilter] = useState("month");
  const [teamFilter, setTeamFilter] = useState("all");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = getStatsByTeam(teamFilter);

  // Prepare chart data
  const statusData = Object.entries(stats.ticketsByStatus).map(
    ([status, count]) => ({
      name: t(`analyticsMenu.status.${status}`, status.replace(/_/g, " ")),
      value: count,
    })
  );

  const priorityData = Object.entries(stats.ticketsByPriority).map(
    ([priority, count]) => ({
      name: t(`analyticsMenu.priority.${priority}`, priority),
      value: count,
    })
  );

  const breachData = Object.entries(stats.breachedByPriority).map(
    ([priority, count]) => ({
      name: t(`analyticsMenu.priority.${priority}`, priority),
      breached: count,
      total: stats.ticketsByPriority[priority],
    })
  );

  const categoryData = stats.ticketsByCategory.map((item) => ({
    category: t(`analyticsMenu.categories.${item.category}`, item.category),
    count: item.count,
  }));

  const getDateRangeText = () => {
    const ranges = {
      week: t("analyticsMenu.filters.last7days", "Last 7 days"),
      month: t("analyticsMenu.filters.last30days", "Last 30 days"),
      year: t("analyticsMenu.filters.last365days", "Last 365 days"),
      custom:
        customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(
              customEndDate
            ).toLocaleDateString()}`
          : t("analyticsMenu.filters.customRange", "Custom Range"),
    };
    return ranges[dateFilter] || ranges.month;
  };

  const getTeamText = () => {
    if (teamFilter === "all")
      return t("analyticsMenu.filters.allTeams", "All Teams");
    const team = TEAMS.find((t) => t.teamId === teamFilter);
    return team
      ? t(`teams.${team.teamId}`, team.teamName)
      : t("analyticsMenu.filters.allTeams", "All Teams");
  };

  return (
    <AdminLayout
      title={t("analyticsMenu.title", "Analytics Dashboard")}
      subtitle={t("analyticsMenu.subtitle", "Performance metrics and insights")}
    >

        {/* Filters Section */}
        <FiltersSection
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          teams={TEAMS}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          showCustomPicker={showCustomPicker}
          setShowCustomPicker={setShowCustomPicker}
          getDateRangeText={getDateRangeText}
          getTeamText={getTeamText}
          isRTL={isRTL}
          t={t}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={t("analyticsMenu.metrics.totalTickets", "Total Tickets")}
            value={stats.totalTickets.toLocaleString("en-US")}
            change={stats.percentageChanges.totalTickets}
            icon={TrendingUp}
            iconColor="blue"
            isRTL={isRTL}
          />
          <MetricCard
            title={t("analyticsMenu.metrics.closedTickets", "Closed Tickets")}
            value={stats.closedTickets.toLocaleString("en-US")}
            change={stats.percentageChanges.closedTickets}
            icon={CheckCircle2}
            iconColor="green"
            isRTL={isRTL}
          />
          <MetricCard
            title={t(
              "analyticsMenu.metrics.avgResponseTime",
              "Avg Response Time"
            )}
            value={`${stats.averageResponseTime.toLocaleString("en-US")}${t(
              "analyticsMenu.metrics.hours",
              "h"
            )}`}
            change={stats.percentageChanges.averageResponseTime}
            icon={TrendingDown}
            iconColor="green"
            isRTL={isRTL}
          />
          <MetricCard
            title={t("analyticsMenu.metrics.slaCompliance", "SLA Compliance")}
            value={`${stats.slaComplianceRate.toFixed(1)}%`}
            change={stats.percentageChanges.slaComplianceRate}
            icon={AlertTriangle}
            iconColor="yellow"
            isRTL={isRTL}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tickets by Status */}
          <PieChartComponent
            data={statusData}
            isRTL={isRTL}
            title={t(
              "analyticsMenu.charts.ticketsByStatus",
              "Tickets by Status"
            )}
          />

          {/* Tickets by Priority */}
          <BarChartComponent
            data={priorityData}
            isRTL={isRTL}
            title={t(
              "analyticsMenu.charts.ticketsByPriority",
              "Tickets by Priority"
            )}
            xDataKey="name"
            yDataKey="value"
            barColor="#3b82f6"
          />

          {/* SLA Breaches by Priority */}
          <MultiBarChartComponent
            data={breachData}
            isRTL={isRTL}
            title={t(
              "analyticsMenu.charts.slaBreachesByPriority",
              "SLA Breaches by Priority"
            )}
            xDataKey="name"
            bars={[
              {
                dataKey: "breached",
                fill: "#ef4444",
                name: t("analyticsMenu.charts.breached", "Breached")
              },
              {
                dataKey: "total",
                fill: "#3b82f6",
                name: t("analyticsMenu.charts.total", "Total")
              }
            ]}
          />

          {/* Tickets by Category */}
          <BarChartComponent
            data={categoryData}
            isRTL={isRTL}
            title={t(
              "analyticsMenu.charts.ticketsByCategory",
              "Tickets by Category"
            )}
            xDataKey="category"
            yDataKey="count"
            barColor="#3b82f6"
          />
        </div>

        {/* Agent Performance Table */}
        <AgentPerformanceTable 
          agentPerformance={stats.agentPerformance}
          isRTL={isRTL}
          t={t}
        />

        {/* Additional Metrics / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <InfoMetricCard
            title={t(
              "analyticsMenu.additionalMetrics.resolutionMetrics",
              "Resolution Metrics"
            )}
            items={[
              {
                label: t(
                  "analyticsMenu.additionalMetrics.avgResolutionTime",
                  "Avg Resolution Time"
                ),
                value: `${stats.resolutionMetrics.avgResolutionTime.toLocaleString(
                  "en-US"
                )}${t("analyticsMenu.metrics.hours", "h")}`,
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.closedThisMonth",
                  "Closed This Month"
                ),
                value:
                  stats.resolutionMetrics.closedThisMonth.toLocaleString(
                    "en-US"
                  ),
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.openTickets",
                  "Open Tickets"
                ),
                value:
                  stats.resolutionMetrics.openTickets.toLocaleString("en-US"),
              },
            ]}
            isRTL={isRTL}
          />

          <InfoMetricCard
            title={t(
              "analyticsMenu.additionalMetrics.slaMetrics",
              "SLA Metrics"
            )}
            items={[
              {
                label: t(
                  "analyticsMenu.additionalMetrics.complianceRate",
                  "Compliance Rate"
                ),
                value: `${stats.slaMetrics.complianceRate.toFixed(1)}%`,
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.totalBreaches",
                  "Total Breaches"
                ),
                value: stats.slaMetrics.totalBreaches.toLocaleString("en-US"),
                color: "text-red-600",
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.criticalBreaches",
                  "Critical Breaches"
                ),
                value:
                  stats.slaMetrics.criticalBreaches.toLocaleString("en-US"),
                color: "text-red-600",
              },
            ]}
            isRTL={isRTL}
          />

          <InfoMetricCard
            title={t(
              "analyticsMenu.additionalMetrics.workloadDistribution",
              "Workload Distribution"
            )}
            items={[
              {
                label: t(
                  "analyticsMenu.additionalMetrics.newTickets",
                  "New Tickets"
                ),
                value:
                  stats.workloadDistribution.newTickets.toLocaleString("en-US"),
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.underProcess",
                  "Under Process"
                ),
                value:
                  stats.workloadDistribution.underProcess.toLocaleString(
                    "en-US"
                  ),
              },
              {
                label: t(
                  "analyticsMenu.additionalMetrics.pendingResponse",
                  "Pending Response"
                ),
                value:
                  stats.workloadDistribution.pendingResponse.toLocaleString(
                    "en-US"
                  ),
              },
            ]}
            isRTL={isRTL}
          />
        </div>
      </AdminLayout>
  );
}

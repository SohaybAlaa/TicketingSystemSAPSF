import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TEAMS, getStatsByTeam } from "../../../../data/mockData";
import { CHART_COLORS, getColorForIndex } from "../../../../utils/helpers";
import { useTranslation } from "react-i18next";

// Helper function for RTL classes
const rtlClass = (base, rtlExtra = "", isRTL) =>
  `${base} ${isRTL ? rtlExtra : ""}`.trim();

// Reusable Components
const FilterButton = ({ active, onClick, children, isRTL }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
      active
        ? "bg-yellow-400 text-black hover:bg-yellow-500"
        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const MetricCard = ({ title, value, change, icon: Icon, iconColor, isRTL }) => {
  const isPositive =
    iconColor === "blue" || iconColor === "green" ? change >= 0 : change <= 0;

  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <p
          className={rtlClass(
            "text-lg font-medium text-gray-600",
            "font-bold",
            isRTL
          )}
        >
          {title}
        </p>
        <Icon
          className={`w-7 h-7 text-${iconColor}-600 transition-transform duration-200 group-hover:scale-110 group-hover:text-${iconColor}-700`}
        />
      </div>
      <p
        className={rtlClass(
          "text-3xl font-bold text-gray-900 mb-1",
          "font-extrabold text-4xl",
          isRTL
        )}
      >
        {value}
      </p>
      <p
        className={`text-sm ${isRTL ? "font-medium" : ""} ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {change >= 0 ? "+" : ""}
        {change}% from last month
      </p>
    </div>
  );
};

const TableHeader = ({ children, isRTL }) => (
  <th
    className={rtlClass(
      "px-6 py-3 text-sm font-semibold text-gray-700",
      "font-bold text-base",
      isRTL
    )}
    style={{ textAlign: isRTL ? "right" : "left" }}
  >
    {children}
  </th>
);

const ChartCard = ({ title, children, isRTL }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2
      className={rtlClass(
        "text-xl font-semibold text-gray-900 mb-4",
        "font-bold text-2xl",
        isRTL
      )}
    >
      {title}
    </h2>
    {children}
  </div>
);

const InfoMetricCard = ({ title, items, isRTL }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h3
      className={rtlClass(
        "text-lg font-semibold text-gray-900 mb-3",
        "font-bold text-xl",
        isRTL
      )}
    >
      {title}
    </h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span
            className={rtlClass(
              "text-sm text-gray-600",
              "font-medium text-base",
              isRTL
            )}
          >
            {item.label}
          </span>
          <span
            className={rtlClass(
              `text-sm font-medium ${item.color || "text-gray-900"}`,
              "font-bold text-base",
              isRTL
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

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

  // Chart styling configuration
  const chartTextStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "normal",
    fontSize: isRTL ? "14px" : "12px",
  };

  const tooltipStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "normal",
  };

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

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
      setShowCustomPicker(false);
    }
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const labelText = isRTL
      ? `${name}:%${(percent * 100).toFixed(0)}`
      : `${name}: ${(percent * 100).toFixed(0)}%`;
    const sliceColor = CHART_COLORS[name] || getColorForIndex(index);
    const textAnchor = isRTL
      ? x > cx
        ? "end"
        : "start"
      : x > cx
      ? "start"
      : "end";

    return (
      <text
        x={x}
        y={y}
        fill={sliceColor}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{
          fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
          fontWeight: isRTL ? "bold" : "700",
          fontSize: isRTL ? "16px" : "14px",
        }}
      >
        {labelText}
      </text>
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={rtlClass(
              "text-3xl font-bold text-gray-900 mb-2",
              "font-extrabold",
              isRTL
            )}
          >
            {t("analyticsMenu.title", "Analytics Dashboard")}
          </h1>
          <p
            className={rtlClass(
              "text-gray-600",
              "text-base font-medium",
              isRTL
            )}
          >
            {t("analyticsMenu.subtitle", "Performance metrics and insights")}
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-8 h-8 text-gray-700" />
              <h2
                className={rtlClass(
                  "text-lg font-semibold text-gray-900",
                  "font-bold text-xl",
                  isRTL
                )}
              >
                {t("analyticsMenu.filters.title", "Filters")}
              </h2>
            </div>
            {showFilters ? (
              <ChevronUp className="w-8 h-8 text-gray-700" />
            ) : (
              <ChevronDown className="w-8 h-8 text-gray-700" />
            )}
          </button>

          {showFilters && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Filter */}
                <div>
                  <label
                    className={rtlClass(
                      "block text-md font-medium text-gray-700 mb-3",
                      "font-bold text-base",
                      isRTL
                    )}
                  >
                    {t("analyticsMenu.filters.team", "Team")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton
                      active={teamFilter === "all"}
                      onClick={() => setTeamFilter("all")}
                      isRTL={isRTL}
                    >
                      {t("analyticsMenu.filters.allTeams", "All Teams")}
                    </FilterButton>
                    {TEAMS.map((team) => (
                      <FilterButton
                        key={team.teamId}
                        active={teamFilter === team.teamId}
                        onClick={() => setTeamFilter(team.teamId)}
                        isRTL={isRTL}
                      >
                        {t(`teams.${team.teamId}`, team.teamName)}
                      </FilterButton>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label
                    className={rtlClass(
                      "block text-md font-medium text-gray-700 mb-3",
                      "font-bold text-base",
                      isRTL
                    )}
                  >
                    {t("analyticsMenu.filters.dateRange", "Date Range")}
                  </label>
                  <div className="flex flex-wrap gap-2 relative">
                    {["week", "month", "year"].map((period) => (
                      <FilterButton
                        key={period}
                        active={dateFilter === period}
                        onClick={() => setDateFilter(period)}
                        isRTL={isRTL}
                      >
                        {t(
                          `analyticsMenu.filters.${period}`,
                          period.charAt(0).toUpperCase() + period.slice(1)
                        )}
                      </FilterButton>
                    ))}
                    <FilterButton
                      active={dateFilter === "custom"}
                      onClick={() => setShowCustomPicker(!showCustomPicker)}
                      isRTL={isRTL}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {t("analyticsMenu.filters.custom", "Custom")}
                    </FilterButton>

                    {/* Custom Date Picker Dropdown */}
                    {showCustomPicker && (
                      <div
                        ref={pickerRef}
                        className={`absolute top-full ${
                          isRTL ? "left-0" : "right-0"
                        } mt-2 bg-white rounded-lg border border-gray-300 shadow-lg p-6 z-10 w-80`}
                      >
                        <h3
                          className={rtlClass(
                            "text-base font-semibold text-gray-900 mb-5",
                            "font-bold text-lg",
                            isRTL
                          )}
                        >
                          {t(
                            "analyticsMenu.filters.selectDateRange",
                            "Select Date Range"
                          )}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label
                              className={rtlClass(
                                "block text-sm font-medium text-gray-700 mb-2",
                                "font-bold",
                                isRTL
                              )}
                            >
                              {t(
                                "analyticsMenu.filters.startDate",
                                "Start Date"
                              )}
                            </label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(e) =>
                                setCustomStartDate(e.target.value)
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div>
                            <label
                              className={rtlClass(
                                "block text-sm font-medium text-gray-700 mb-2",
                                "font-bold",
                                isRTL
                              )}
                            >
                              {t("analyticsMenu.filters.endDate", "End Date")}
                            </label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              min={customStartDate}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div className="flex gap-3 pt-3">
                            <button
                              onClick={handleCustomDateApply}
                              disabled={!customStartDate || !customEndDate}
                              className={rtlClass(
                                "flex-1 px-4 py-2.5 bg-yellow-500 text-black rounded-lg font-medium cursor-pointer hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors",
                                "font-bold",
                                isRTL
                              )}
                            >
                              {t("analyticsMenu.filters.apply", "Apply")}
                            </button>
                            <button
                              onClick={() => setShowCustomPicker(false)}
                              className={rtlClass(
                                "flex-1 px-4 py-2.5 bg-white border border-gray-300 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
                                "font-bold",
                                isRTL
                              )}
                            >
                              {t("analyticsMenu.filters.cancel", "Cancel")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p
                  className={rtlClass(
                    "text-sm text-gray-600",
                    "font-medium text-base",
                    isRTL
                  )}
                >
                  {t(
                    "analyticsMenu.filters.showingResults",
                    "Showing results for"
                  )}{" "}
                  <span
                    className={rtlClass(
                      "font-semibold text-gray-900",
                      "font-bold",
                      isRTL
                    )}
                  >
                    {getTeamText()}
                  </span>{" "}
                  •{" "}
                  <span
                    className={rtlClass(
                      "font-semibold text-gray-900",
                      "font-bold",
                      isRTL
                    )}
                  >
                    {getDateRangeText()}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

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
          <ChartCard
            title={t(
              "analyticsMenu.charts.ticketsByStatus",
              "Tickets by Status"
            )}
            isRTL={isRTL}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[entry.name] || getColorForIndex(index)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  wrapperStyle={{ outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tickets by Priority */}
          <ChartCard
            title={t(
              "analyticsMenu.charts.ticketsByPriority",
              "Tickets by Priority"
            )}
            isRTL={isRTL}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" style={chartTextStyle} reversed={isRTL} />
                <YAxis style={chartTextStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  label={{
                    position: "top",
                    style: { fontWeight: isRTL ? "bold" : "normal" },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* SLA Breaches by Priority */}
          <ChartCard
            title={t(
              "analyticsMenu.charts.slaBreachesByPriority",
              "SLA Breaches by Priority"
            )}
            isRTL={isRTL}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breachData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" style={chartTextStyle} reversed={isRTL} />
                <YAxis style={chartTextStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={tooltipStyle} />
                <Bar
                  dataKey="breached"
                  fill="#ef4444"
                  name={t("analyticsMenu.charts.breached", "Breached")}
                />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  name={t("analyticsMenu.charts.total", "Total")}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Tickets by Category */}
          <ChartCard
            title={t(
              "analyticsMenu.charts.ticketsByCategory",
              "Tickets by Category"
            )}
            isRTL={isRTL}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  style={chartTextStyle}
                  reversed={isRTL}
                />
                <YAxis style={chartTextStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  label={{
                    position: "top",
                    style: { fontWeight: isRTL ? "bold" : "normal" },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Agent Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2
            className={rtlClass(
              "text-xl font-semibold text-gray-900 mb-4",
              "font-bold text-2xl",
              isRTL
            )}
          >
            {t("analyticsMenu.agentPerformance.title", "Agent Performance")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.agentName",
                      "Agent Name"
                    )}
                  </TableHeader>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.ticketsHandled",
                      "Tickets Handled"
                    )}
                  </TableHeader>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.avgResponseTime",
                      "Avg Response Time (hrs)"
                    )}
                  </TableHeader>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.avgResolutionTime",
                      "Avg Resolution Time (hrs)"
                    )}
                  </TableHeader>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.slaBreaches",
                      "SLA Breaches"
                    )}
                  </TableHeader>
                  <TableHeader isRTL={isRTL}>
                    {t(
                      "analyticsMenu.agentPerformance.performance",
                      "Performance"
                    )}
                  </TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.agentPerformance.map((agent, index) => {
                  const breachRate =
                    agent.tickets_handled > 0
                      ? (agent.breached_count / agent.tickets_handled) * 100
                      : 0;
                  const performanceGrade =
                    breachRate < 10
                      ? t(
                          "analyticsMenu.agentPerformance.excellent",
                          "Excellent"
                        )
                      : breachRate < 20
                      ? t("analyticsMenu.agentPerformance.good", "Good")
                      : t(
                          "analyticsMenu.agentPerformance.needsImprovement",
                          "Needs Improvement"
                        );
                  const gradeColor =
                    breachRate < 10
                      ? "text-green-600"
                      : breachRate < 20
                      ? "text-yellow-600"
                      : "text-red-600";
                  const agentNameKey = agent.agent_name
                    .toLowerCase()
                    .replace(/\s+/g, "_");
                  const displayName = t(
                    `analyticsMenu.agents.${agentNameKey}`,
                    agent.agent_name
                  );

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td
                        className={rtlClass(
                          "px-6 py-4 text-sm font-medium text-gray-900",
                          "font-bold text-base",
                          isRTL
                        )}
                      >
                        {displayName}
                      </td>
                      <td
                        className={rtlClass(
                          "px-6 py-4 text-sm font-bold text-gray-900",
                          "text-base",
                          isRTL
                        )}
                      >
                        {agent.tickets_handled.toLocaleString("en-US")}
                      </td>
                      <td
                        className={rtlClass(
                          "px-6 py-4 text-sm font-bold text-gray-900",
                          "text-base",
                          isRTL
                        )}
                      >
                        {agent.avg_response_time.toFixed(1)}
                      </td>
                      <td
                        className={rtlClass(
                          "px-6 py-4 text-sm font-bold text-gray-900",
                          "text-base",
                          isRTL
                        )}
                      >
                        {agent.avg_resolution_time.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={rtlClass(
                            `font-bold ${
                              agent.breached_count > 0
                                ? "text-red-600"
                                : "text-gray-900"
                            }`,
                            "text-base",
                            isRTL
                          )}
                        >
                          {agent.breached_count.toLocaleString("en-US")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={rtlClass(
                            `${gradeColor} font-medium`,
                            "font-bold text-base",
                            isRTL
                          )}
                        >
                          {performanceGrade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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
      </div>
    </div>
  );
}

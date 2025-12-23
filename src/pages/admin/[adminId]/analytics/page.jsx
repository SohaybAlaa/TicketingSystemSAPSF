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
import {
  TEAMS,
  getStatsByTeam,
  CHART_COLORS,
  getColorForIndex,
} from "../../../../data/mockData";

export default function Analytics() {
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

  // Get stats based on selected team filter
  const stats = getStatsByTeam(teamFilter);

  const statusData = Object.entries(stats.ticketsByStatus).map(
    ([status, count]) => ({
      name: status.replace(/_/g, " "),
      value: count,
    })
  );

  const priorityData = Object.entries(stats.ticketsByPriority).map(
    ([priority, count]) => ({
      name: priority,
      value: count,
    })
  );

  const breachData = Object.entries(stats.breachedByPriority).map(
    ([priority, count]) => ({
      name: priority,
      breached: count,
      total: stats.ticketsByPriority[priority],
    })
  );

  const getDateRangeText = () => {
    const ranges = {
      week: "Last 7 days",
      month: "Last 30 days",
      year: "Last 365 days",
      custom:
        customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(
              customEndDate
            ).toLocaleDateString()}`
          : "Custom Range",
    };
    return ranges[dateFilter] || "Last 30 days";
  };

  const getTeamText = () => {
    if (teamFilter === "all") return "All Teams";
    const team = TEAMS.find((t) => t.teamId === teamFilter);
    return team ? team.teamName : "All Teams";
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-8 h-8 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Team
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTeamFilter("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        teamFilter === "all"
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All Teams
                    </button>
                    {TEAMS.map((team) => (
                      <button
                        key={team.teamId}
                        onClick={() => setTeamFilter(team.teamId)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          teamFilter === team.teamId
                            ? "bg-yellow-400 text-black hover:bg-yellow-500"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {team.teamName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Date Range
                  </label>
                  <div className="flex flex-wrap gap-2 relative">
                    <button
                      onClick={() => setDateFilter("week")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        dateFilter === "week"
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setDateFilter("month")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        dateFilter === "month"
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setDateFilter("year")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        dateFilter === "year"
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Year
                    </button>
                    <button
                      onClick={() => setShowCustomPicker(!showCustomPicker)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        dateFilter === "custom"
                          ? "bg-yellow-400 text-black hover:bg-yellow-500"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Custom
                    </button>

                    {/* Custom Date Picker Dropdown */}
                    {showCustomPicker && (
                      <div
                        ref={pickerRef}
                        className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-300 shadow-lg p-6 z-10 w-80"
                      >
                        <h3 className="text-base font-semibold text-gray-900 mb-5">
                          Select Date Range
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Date
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Date
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
                              className="flex-1 px-4 py-2.5 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => setShowCustomPicker(false)}
                              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                              Cancel
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
                <p className="text-sm text-gray-600">
                  Showing results for{" "}
                  <span className="font-semibold text-gray-900">
                    {getTeamText()}
                  </span>{" "}
                  •{" "}
                  <span className="font-semibold text-gray-900">
                    {getDateRangeText()}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets Card */}
          <div className="group bg-white rounded-lg border border-gray-200 p-6 transition hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium text-gray-600">Total Tickets</p>
              <TrendingUp className="w-7 h-7 text-blue-600 transition-transform transition-colors duration-200 group-hover:scale-110 group-hover:text-blue-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalTickets}
            </p>
            <p
              className={`text-sm ${
                stats.percentageChanges.totalTickets >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChanges.totalTickets >= 0 ? "+" : ""}
              {stats.percentageChanges.totalTickets}% from last month
            </p>
          </div>

          {/* Closed Tickets Card */}
          <div className="group bg-white rounded-lg border border-gray-200 p-6 transition hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium text-gray-600">
                Closed Tickets
              </p>
              <CheckCircle2 className="w-7 h-7 text-green-600 transition-transform transition-colors duration-200 group-hover:scale-110 group-hover:text-green-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.closedTickets}
            </p>
            <p
              className={`text-sm ${
                stats.percentageChanges.closedTickets >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChanges.closedTickets >= 0 ? "+" : ""}
              {stats.percentageChanges.closedTickets}% from last month
            </p>
          </div>

          {/* Avg Response Time Card */}
          <div className="group bg-white rounded-lg border border-gray-200 p-6 transition hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium text-gray-600">
                Avg Response Time
              </p>
              <TrendingDown className="w-7 h-7 text-green-600 transition-transform transition-colors duration-200 group-hover:scale-110 group-hover:text-green-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageResponseTime}h
            </p>
            <p
              className={`text-sm ${
                stats.percentageChanges.averageResponseTime <= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChanges.averageResponseTime}% from last month
            </p>
          </div>

          {/* SLA Compliance Card */}
          <div className="group bg-white rounded-lg border border-gray-200 p-6 transition hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium text-gray-600">
                SLA Compliance
              </p>
              <AlertTriangle className="w-7 h-7 text-yellow-600 transition-transform transition-colors duration-200 group-hover:scale-110 group-hover:text-yellow-700" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.slaComplianceRate.toFixed(1)}%
            </p>
            <p
              className={`text-sm ${
                stats.percentageChanges.slaComplianceRate >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChanges.slaComplianceRate >= 0 ? "+" : ""}
              {stats.percentageChanges.slaComplianceRate}% from last month
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tickets by Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tickets by Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[entry.name] || getColorForIndex(index)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tickets by Priority */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tickets by Priority
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  label={{ position: "top" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SLA Breaches by Priority */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              SLA Breaches by Priority
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breachData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="breached" fill="#ef4444" name="Breached" />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tickets by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tickets by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ticketsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  label={{ position: "top" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Agent Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Agent Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Tickets Handled
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Avg Response Time (hrs)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Avg Resolution Time (hrs)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    SLA Breaches
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Performance
                  </th>
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
                      ? "Excellent"
                      : breachRate < 20
                      ? "Good"
                      : "Needs Improvement";
                  const gradeColor =
                    breachRate < 10
                      ? "text-green-600"
                      : breachRate < 20
                      ? "text-yellow-600"
                      : "text-red-600";

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {agent.agent_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {agent.tickets_handled}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {agent.avg_response_time.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {agent.avg_resolution_time.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            agent.breached_count > 0
                              ? "text-red-600 font-medium"
                              : "text-gray-700"
                          }
                        >
                          {agent.breached_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`${gradeColor} font-medium`}>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Resolution Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Avg Resolution Time
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.resolutionMetrics.avgResolutionTime}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Closed This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.resolutionMetrics.closedThisMonth}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Open Tickets</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.resolutionMetrics.openTickets}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              SLA Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compliance Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.slaMetrics.complianceRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Breaches</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.slaMetrics.totalBreaches}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Critical Breaches</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.slaMetrics.criticalBreaches}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Workload Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Tickets</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.workloadDistribution.newTickets}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Under Process</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.workloadDistribution.underProcess}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Response</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.workloadDistribution.pendingResponse}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

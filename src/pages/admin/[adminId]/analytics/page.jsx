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
} from "lucide-react";

const mockStats = {
  totalTickets: 1247,
  closedTickets: 892,
  averageResponseTime: 4.2,
  averageResolutionTime: 18.5,
  slaComplianceRate: 87.3,
  ticketsByStatus: {
    NEW: 145,
    UNDER_PROCESS: 210,
    PENDING_EMPLOYEE: 87,
    PENDING_THIRD_PARTY: 56,
    COMPLETED: 123,
    CLOSED: 626,
  },
  ticketsByPriority: {
    LOW: 412,
    MEDIUM: 543,
    HIGH: 234,
    CRITICAL: 58,
  },
  breachedByPriority: {
    LOW: 15,
    MEDIUM: 48,
    HIGH: 67,
    CRITICAL: 28,
  },
  ticketsByCategory: [
    { category: "Technical Support", count: 425 },
    { category: "Account Issues", count: 289 },
    { category: "Billing", count: 187 },
    { category: "Product Inquiry", count: 156 },
    { category: "Bug Report", count: 134 },
    { category: "Other", count: 56 },
  ],
  agentPerformance: [
    {
      agent_name: "Sarah Johnson",
      tickets_handled: 156,
      avg_response_time: 3.2,
      avg_resolution_time: 15.4,
      breached_count: 8,
    },
    {
      agent_name: "Michael Chen",
      tickets_handled: 142,
      avg_response_time: 4.1,
      avg_resolution_time: 17.2,
      breached_count: 12,
    },
    {
      agent_name: "Emily Rodriguez",
      tickets_handled: 138,
      avg_response_time: 3.8,
      avg_resolution_time: 16.1,
      breached_count: 15,
    },
    {
      agent_name: "David Kim",
      tickets_handled: 129,
      avg_response_time: 5.2,
      avg_resolution_time: 21.3,
      breached_count: 28,
    },
    {
      agent_name: "Jessica Taylor",
      tickets_handled: 125,
      avg_response_time: 3.5,
      avg_resolution_time: 14.8,
      breached_count: 6,
    },
    {
      agent_name: "Robert Martinez",
      tickets_handled: 118,
      avg_response_time: 4.8,
      avg_resolution_time: 19.7,
      breached_count: 22,
    },
  ],
};

export default function Analytics() {
  const [dateFilter, setDateFilter] = useState("month");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
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

  const stats = mockStats;

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

  const COLORS = {
    NEW: "#9333ea",
    "UNDER PROCESS": "#3b82f6",
    "PENDING EMPLOYEE": "#eab308",
    "PENDING THIRD PARTY": "#f97316",
    COMPLETED: "#22c55e",
    CLOSED: "#6b7280",
    LOW: "#3b82f6",
    MEDIUM: "#eab308",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
  };

  const getColorForIndex = (index) => {
    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#6366f1",
    ];
    return colors[index % colors.length];
  };

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

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Performance metrics and insights for {getDateRangeText()}
            </p>
          </div>

          <div className="flex gap-2 relative flex-wrap">
            <button
              onClick={() => setDateFilter("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateFilter === "week"
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 duration-600 ease-in-out"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 duration-600 ease-in-out"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setDateFilter("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateFilter === "month"
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 duration-600 ease-in-out"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 duration-600 ease-in-out"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setDateFilter("year")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateFilter === "year"
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 duration-600 ease-in-out"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 duration-600 ease-in-out"
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                dateFilter === "custom"
                  ? "bg-yellow-500 text-black hover:bg-yellow-400 duration-600 ease-in-out"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 duration-600 ease-in-out"
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
                      onChange={(e) => setCustomStartDate(e.target.value)}
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalTickets}
            </p>
            <p className="text-sm text-green-600">+12% from last month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Closed Tickets
              </p>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.closedTickets}
            </p>
            <p className="text-sm text-green-600">+8% from last month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Avg Response Time
              </p>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageResponseTime}h
            </p>
            <p className="text-sm text-green-600">-15% from last month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                SLA Compliance
              </p>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.slaComplianceRate.toFixed(1)}%
            </p>
            <p className="text-sm text-red-600">-3% from last month</p>
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
                      fill={COLORS[entry.name] || getColorForIndex(index)}
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
                  {stats.averageResolutionTime}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Closed This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.closedTickets}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Open Tickets</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalTickets - stats.closedTickets}
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
                  {stats.slaComplianceRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Breaches</span>
                <span className="text-sm font-medium text-red-600">
                  {Object.values(stats.breachedByPriority).reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Critical Breaches</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.breachedByPriority.CRITICAL}
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
                  {stats.ticketsByStatus.NEW}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Under Process</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.ticketsByStatus.UNDER_PROCESS}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Response</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.ticketsByStatus.PENDING_EMPLOYEE +
                    stats.ticketsByStatus.PENDING_THIRD_PARTY}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  CheckCheck,
  MailOpen,
  ShieldAlert,
  ShieldX,
  TicketPlus,
  Loader2,
  ClockAlert,
  Tags,
  BarChart3,
  Target,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@layouts/AdminLayout"; // Layout wrapper
import AlertNotification from "@ui/AlertNotification"; // Shows pop-up success/error/warning messages on screen
import MetricCard from "@ui/MetricCard"; // The 4 cards at the top (e.g. Total Tickets, SLA Compliance)
import InfoMetricCard from "@ui/InfoMetricCard"; // The 3 info cards at the bottom (Resolution Metrics, SLA Metrics, Workload)
import PieChartComponent from "@charts/PieChartComponent"; // Donut/Pie chart
import BarChartComponent from "@charts/BarChartComponent"; // Single bar chart
import MultiBarChartComponent from "@charts/MultiBarChartComponent"; // Grouped bar chart
import AgentPerformanceTable from "@tables/AgentPerformanceTable"; // The AG Grid table that shows each agent's performance stats
import FiltersSection from "@filters/FiltersSection"; // The filter bar at the top (date range picker, team dropdown)

export default function Analytics() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // useNavigate lets us redirect the user to another page
  const isRTL = i18n.language === "ar";
  const [dateFilter, setDateFilter] = useState("month"); // Default to monthly view
  const [teamFilter, setTeamFilter] = useState("all"); // Default to showing all teams
  const [showCustomPicker, setShowCustomPicker] = useState(false); // Controls whether to show the calendar date-range picker popup
  const [showFilters, setShowFilters] = useState(true); // Controls whether the filter bar is visible or collapsed
  const [customStartDate, setCustomStartDate] = useState(""); // for custom start date range input // These are just strings in "YYYY-MM-DD" format, which we later convert to Date objects when making the API call.
  const [customEndDate, setCustomEndDate] = useState(""); // for custom end date range input
  const [loading, setLoading] = useState(true); // Loading state — true while we're waiting for API data
  const [error, setError] = useState(null); // Stores any error message if an API call fails
  const [stats, setStats] = useState(null); // Stores all the analytics data returned from the API
  const [alerts, setAlerts] = useState([]); // Stores the list of alert notifications to show (success/error banners)
  const [teams, setTeams] = useState([]); // Stores the list of teams fetched from the database (used in the team dropdown)
  const pickerRef = useRef(null); // We use this to detect clicks outside the date picker popup so we can close it.

  // HELPER: showAlert Adds a new alert notification to the screen ,It auto-removes itself after 4 seconds.
  const showAlert = (type, message) => {
    const id = Date.now() + Math.random(); // Create a unique ID using the current timestamp + a random number
    const newAlert = { id, type, message };
    setAlerts((prev) => [...prev, newAlert]); // Add the new alert to the existing list (don't replace — append)
    setTimeout(() => removeAlert(id), 4000); // After 4 seconds, automatically remove it
  };

  const removeAlert = (id) => {
    // Removes a specific alert by its unique ID
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // EFFECT: Close date picker when user clicks outside it
  useEffect(() => {
    function handleClickOutside(event) {
      // If the click happened outside the pickerRef element, close the picker
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside); // Attach the listener when the component loads
    return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup: remove the listener when the component unmounts (to avoid memory leaks)
  }, []);

  // EFFECT: Fetch the list of teams from the database (Runs once on component mount)
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/public/analytics/teams");
        const data = await response.json();
        if (data.success && data.data) {
          // If the API returns success and has data, save it to state
          setTeams(data.data);
        }
      } catch (err) {
        // If something goes wrong, just log it we dont show an error for this
        console.error("Error fetching teams:", err);
      }
    };
    fetchTeams();
  }, []);

  // HELPER: getDateRange Returns { startDate, endDate } as ISO strings (e.g. "2024-01-01") based on whichever date filter is currently selected.
  const getDateRange = () => {
    const end = new Date(); // Today's date
    const start = new Date(); // We'll adjust this below
    if (dateFilter === "week") {
      // Go back 7 days
      start.setDate(end.getDate() - 7);
    } else if (dateFilter === "month") {
      // Go back 1 month
      start.setMonth(end.getMonth() - 1);
    } else if (dateFilter === "year") {
      // Go back 1 year
      start.setFullYear(end.getFullYear() - 1);
    } else if (dateFilter === "custom") {
      // Use whatever dates the user typed in manually
      if (customStartDate && customEndDate) {
        return {
          startDate: new Date(customStartDate).toISOString().split("T")[0], // Convert to ISO and take just the date part "YYYY-MM-DD"
          endDate: new Date(customEndDate).toISOString().split("T")[0], // ["2026-03-04", "14:30:00.000Z"] take the first part only
        };
      }
      return { startDate: null, endDate: null }; // If custom is selected but dates aren't filled in yet, return nulls
    }

    return {
      startDate: start.toISOString().split("T")[0], // e.g. "2024-03-01"
      endDate: end.toISOString().split("T")[0], // e.g. "2024-04-01"
    };
  };

  // EFFECT: Fetch all analytics data from the API , Re-runs whenever dateFilter or teamFilter changes (listed in the dependency array at the bottom)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true); // Show the loading spinner
        setError(null); // Clear any previous error

        // Don't fetch if the user picked "custom" but hasn't entered both dates yet
        if (dateFilter === "custom" && (!customStartDate || !customEndDate)) {
          setLoading(false);
          return;
        }

        const dateRange = getDateRange();

        // If "all teams" is selected, send null (no team filter)
        const team = teamFilter === "all" ? null : teamFilter;

        // Build the query string to append to each API URL
        // e.g. "?startDate=2024-01-01&endDate=2024-04-01&team=engineering"
        const params = new URLSearchParams();
        if (dateRange.startDate)
          params.append("startDate", dateRange.startDate);
        if (dateRange.endDate) params.append("endDate", dateRange.endDate);
        if (team) params.append("team", team);

        // Fire all 8 API requests at the same time using Promise.all
        // This is faster than doing them one by one
        const [
          overviewRes,
          statusRes,
          priorityRes,
          categoryRes,
          slaRes,
          slaByPriorityRes,
          resolutionRes,
          agentPerfRes,
        ] = await Promise.all([
          fetch(`/api/public/analytics/overview?${params}`), // General totals
          fetch(`/api/public/analytics/status?${params}`), // Tickets grouped by status
          fetch(`/api/public/analytics/priority?${params}`), // Tickets grouped by priority
          fetch(`/api/public/analytics/category?${params}`), // Tickets grouped by category
          fetch(`/api/public/analytics/sla-breach?${params}`), // Overall SLA breach info
          fetch(`/api/public/analytics/sla-breach-by-priority?${params}`), // SLA breaches per priority
          fetch(`/api/public/analytics/resolution-time?${params}`), // Average resolution time
          fetch(`/api/public/analytics/agent-performance?${params}`), // Per-agent stats
        ]);

        // Parse all responses as JSON simultaneously
        const [
          overview,
          statusData,
          priorityData,
          categoryData,
          slaData,
          slaByPriorityData,
          resolutionData,
          agentPerfData,
        ] = await Promise.all([
          overviewRes.json(),
          statusRes.json(),
          priorityRes.json(),
          categoryRes.json(),
          slaRes.json(),
          slaByPriorityRes.json(),
          resolutionRes.json(),
          agentPerfRes.json(),
        ]);

        // VALIDATION Check that each API returned a "data" field.
        // If any are missing, collect their names and throw an error.
        const validationErrors = [];
        if (!overview?.data) validationErrors.push("overview"); // Check if overview.data does not exist optional chaining
        if (!statusData?.data) validationErrors.push("status");
        if (!priorityData?.data) validationErrors.push("priority");
        if (!categoryData?.data) validationErrors.push("category");
        if (!slaData?.data) validationErrors.push("sla-breach");
        if (!slaByPriorityData?.data)
          validationErrors.push("sla-breach-by-priority");
        if (!agentPerfData?.data) validationErrors.push("agent-performance");

        if (validationErrors.length > 0) {
          console.error("Failed API endpoints:", validationErrors);
          throw new Error(
            `Invalid API response from: ${validationErrors.join(", ")}`,
          );
        }

        // DATA TRANSFORMATION The API returns raw arrays. We reshape them into the exact format our components need
        const transformedStats = {// Simple totals from the overview endpoint
          totalTickets: overview.data.totalTickets || 0,
          closedTickets: overview.data.closedTickets || 0,
          averageResponseTime: 0, // Not provided by the API currently
          slaComplianceRate: overview.data.slaComplianceRate || 0,

          // Percentage change values (used to show +/- arrows on metric cards)
          percentageChanges: {
            totalTickets: 0,
            closedTickets: 0,
            averageResponseTime: 0,
            slaComplianceRate: 0,
          },

          // Convert the status array into a key-value object
          // Input:  [{ status: "Open", count: 10 }, { status: "Closed", count: 5 }]
          // Output: { Open: 10, Closed: 5 }
          ticketsByStatus: (statusData.data || []).reduce((acc, item) => {
            if (item.status) {
              acc[item.status] = item.count;
            }
            return acc;
          }, {}),

          // Same shape transformation for priority data
          ticketsByPriority: (priorityData.data || []).reduce((acc, item) => {
            if (item.priority) {
              acc[item.priority] = item.count;
            }
            return acc;
          }, {}),

          // How many tickets were breached per priority level
          breachedByPriority: (slaByPriorityData.data || []).reduce(
            (acc, item) => {
              if (item.priority) {
                acc[item.priority] = item.breached;
              }
              return acc;
            },
            {},
          ),

          // Raw array of categories (filtered to remove nulls)
          ticketsByCategory: (categoryData.data || []).filter(
            (item) => item.category,
          ),

          // Agent performance rows — normalize missing values to 0
          agentPerformance: agentPerfData.data.map((item) => ({
            agent_name: item.agent_name || "Unknown",
            tickets_handled: item.tickets_handled || 0,
            under_process: item.under_process || 0,
            avg_resolution_time: item.avg_resolution_time || 0,
            breached_count: item.breached_count || 0,
          })),

          // Grouped metrics for the "Resolution Metrics" info card
          resolutionMetrics: {
            avgResolutionTime: overview.data.avgResolutionTime || 0,
            closedThisMonth: overview.data.closedTickets || 0,
            openTickets:
              overview.data.totalTickets - overview.data.closedTickets || 0,
          },

          // Grouped metrics for the "SLA Metrics" info card
          slaMetrics: {
            complianceRate: overview.data.slaComplianceRate || 0,
            totalBreaches: overview.data.slaBreached || 0,
            criticalBreaches: overview.data.criticalBreaches || 0,
          },

          // Grouped metrics for the "Workload Distribution" info card
          workloadDistribution: {
            newTickets:
              statusData.data.find((s) => s.status === "New")?.count || 0,
            underProcess:
              statusData.data.find((s) => s.status === "Under Process")
                ?.count || 0,
            pendingResponse:
              statusData.data.find((s) => s.status === "Pending Third Party")
                ?.count || 0,
          },
        };

        // Save the final transformed data into state — this triggers a re-render
        setStats(transformedStats);
      } catch (err) {
        // If any API call or data processing fails, show an error
        console.error("Error fetching analytics:", err);
        setError(err.message);
        showAlert("error", err.message);
      } finally {
        // Always turn off the loading spinner, whether we succeeded or failed
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateFilter, teamFilter]); // Re-run this effect when either filter changes

  // CHART DATA PREPARATION
  // These sections take the raw stats and format them for each chart.
  
  // --- Pie chart: Tickets by Status ---
  // Converts { Open: 10, Closed: 5 } → [{ name: "Open", value: 10 }, ...]
  const statusData = stats
    ? Object.entries(stats.ticketsByStatus)
        .filter(
          ([status]) => status && status !== "null" && status !== "undefined",
        )
        .map(([status, count]) => ({
          name: t(`analyticsMenu.status.${status}`, status.replace(/_/g, " ")), // Translate or fallback
          value: count,
        }))
    : [];

  // Keep original (untranslated) status names so the Pie chart can look up colors
  const originalStatusNames = stats
    ? Object.entries(stats.ticketsByStatus)
        .filter(
          ([status]) => status && status !== "null" && status !== "undefined",
        )
        .map(([status]) => status)
    : [];

  // --- Bar chart: Tickets by Priority ---
  // This defines the display order for priorities (most urgent first)
  const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"];
  const sortByPriority = ([a]) =>
    PRIORITY_ORDER.indexOf(a) === -1 ? 99 : PRIORITY_ORDER.indexOf(a);

  const priorityData = stats
    ? Object.entries(stats.ticketsByPriority)
        .filter(
          ([priority]) =>
            priority && priority !== "null" && priority !== "undefined",
        )
        .sort((a, b) => sortByPriority(a) - sortByPriority(b)) // Sort: Critical → High → Medium → Low
        .map(([priority, count]) => ({
          name: t(`analyticsMenu.priority.${priority}`, priority),
          value: count,
        }))
    : [];

  // Keep original priority names for color lookup
  const originalPriorityNames = stats
    ? Object.entries(stats.ticketsByPriority)
        .filter(
          ([priority]) =>
            priority && priority !== "null" && priority !== "undefined",
        )
        .sort((a, b) => sortByPriority(a) - sortByPriority(b))
        .map(([priority]) => priority)
    : [];

  // --- Multi-bar chart: SLA Breaches by Priority ---
  // Each bar group has both "breached" and "total" values side by side
  const breachData = stats
    ? Object.entries(stats.breachedByPriority)
        .filter(
          ([priority]) =>
            priority && priority !== "null" && priority !== "undefined",
        )
        .sort((a, b) => sortByPriority(a) - sortByPriority(b))
        .map(([priority, count]) => ({
          name: t(`analyticsMenu.priority.${priority}`, priority),
          breached: count,
          total: stats.ticketsByPriority[priority] || 0, // Look up total for this priority
        }))
    : [];

  const originalBreachPriorityNames = stats
    ? Object.entries(stats.breachedByPriority)
        .filter(
          ([priority]) =>
            priority && priority !== "null" && priority !== "undefined",
        )
        .sort((a, b) => sortByPriority(a) - sortByPriority(b))
        .map(([priority]) => priority)
    : [];

  // --- Bar chart: Tickets by Category ---
  // Translates category names and maps them to { category, count } shape
  const categoryData = stats
    ? stats.ticketsByCategory
        .filter((item) => item && item.category)
        .map((item) => {
          const translationKey = `analyticsMenu.categories.${item.category}`;
          const translatedValue = t(translationKey, item.category); // Translate or use raw value
          return {
            category: translatedValue,
            count: item.count || 0,
          };
        })
    : [];

  // HELPER: getDateRangeText
  // Returns a human-readable label for the currently selected date range.
  // Used in the filter bar UI.
  const getDateRangeText = () => {
    const ranges = {
      week: t("analyticsMenu.filters.last7days", "Last 7 days"),
      month: t("analyticsMenu.filters.last30days", "Last 30 days"),
      year: t("analyticsMenu.filters.last365days", "Last 365 days"),
      custom:
        customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
          : t("analyticsMenu.filters.customRange", "Custom Range"),
    };
    return ranges[dateFilter] || ranges.month;
  };

  // HELPER: getTeamText
  // Returns the display name of the currently selected team.
  const getTeamText = () => {
    if (teamFilter === "all")
      return t("analyticsMenu.filters.allTeams", "All Teams");

    // Find the team object in our teams array that matches the selected ID
    const team = teams.find((t) => t.teamId === teamFilter);
    return team
      ? t(`teams.${team.teamId}`, team.teamName)
      : t("analyticsMenu.filters.allTeams", "All Teams");
  };

  // EARLY RETURNS
  // These show alternative UI while data is loading or if something went wrong.
  // React will not render the main JSX below until stats is populated.

  // Show a spinner while the API data is loading
  if (loading) {
    return (
      <AdminLayout
        title={t("analyticsMenu.title", "Analytics Dashboard")}
        subtitle={t(
          "analyticsMenu.subtitle",
          "Performance metrics and insights",
        )}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500 mx-auto mb-4"></div>
            <p className="!text-gray-600 !font-semibold">
              {t("analyticsMenu.loading", "Loading...")}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show an error message if any API call failed
  if (error) {
    return (
      <AdminLayout
        title={t("analyticsMenu.title", "Analytics Dashboard")}
        subtitle={t(
          "analyticsMenu.subtitle",
          "Performance metrics and insights",
        )}
      >
        <AlertNotification alerts={alerts} onClose={removeAlert} />
        <div className="text-center py-12">
          <p className="text-gray-600">
            {t("common.error", "Error loading analytics data")}
          </p>
        </div>
      </AdminLayout>
    );
  }

  // Show a "no data" message if the API returned nothing
  if (!stats) {
    return (
      <AdminLayout
        title={t("analyticsMenu.title", "Analytics Dashboard")}
        subtitle={t(
          "analyticsMenu.subtitle",
          "Performance metrics and insights",
        )}
      >
        <div className="text-center py-12">
          <p className="text-gray-600">
            {t("common.noData", "No data available")}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={t("analyticsMenu.title", "Analytics Dashboard")}
      subtitle={t("analyticsMenu.subtitle", "Performance metrics and insights")}
    >
      {/* FILTERS BAR */}
      <FiltersSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        teams={teams}
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

      {/* TOP METRIC CARDS (4 cards in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tickets — navigates to /admin/tickets */}
        <MetricCard
          title={t("analyticsMenu.metrics.totalTickets", "Total Tickets")}
          value={stats.totalTickets.toLocaleString("en-US")}
          change={stats.percentageChanges.totalTickets}
          icon={Tags}
          iconColor="yellow"
          isRTL={isRTL}
          onClick={() => navigate("/admin/tickets")}
        />

        {/* Open Tickets = Total minus Closed */}
        <MetricCard
          title={t("analyticsMenu.metrics.openTickets", "Open Tickets")}
          value={(stats.totalTickets - stats.closedTickets).toLocaleString(
            "en-US",
          )}
          change={0}
          icon={MailOpen}
          iconColor="purple"
          isRTL={isRTL}
          onClick={() => navigate("/admin/tickets?filter=openTickets")}
        />

        {/* Average Resolution Time — converts decimal hours into "Xh Ym" format */}
        <MetricCard
          title={t(
            "analyticsMenu.metrics.avgResolutionTime",
            "Avg Resolution Time",
          )}
          value={(() => {
            // e.g. 2.5 hours → "2h 30m"
            const totalHours = stats.resolutionMetrics.avgResolutionTime;
            const hours = Math.floor(totalHours);
            const minutes = Math.round((totalHours - hours) * 60);
            return minutes > 0
              ? `${hours}${t("analyticsMenu.metrics.hours", "h")} ${minutes}${t("analyticsMenu.metrics.minutes", "m")}`
              : `${hours}${t("analyticsMenu.metrics.hours", "h")}`;
          })()}
          change={stats.percentageChanges.avgResolutionTime || 0}
          icon={Clock}
          iconColor="blue"
          isRTL={isRTL}
        />

        {/* SLA Compliance Rate — shown as a percentage */}
        <MetricCard
          title={t("analyticsMenu.metrics.slaCompliance", "SLA Compliance")}
          value={`${stats.slaComplianceRate.toFixed(1)}%`}
          change={stats.percentageChanges.slaComplianceRate}
          icon={CheckCheck}
          iconColor="green"
          isRTL={isRTL}
          onClick={() => navigate("/admin/tickets?filter=closed30Days")}
        />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie chart — how tickets are split by status (Open, Closed, etc.) */}
        <PieChartComponent
          data={statusData}
          isRTL={isRTL}
          title={t("analyticsMenu.charts.ticketsByStatus", "Tickets by Status")}
          useStatusColors={true} // Use predefined status color map
          originalNames={originalStatusNames} // Needed for color lookup
        />

        {/* Bar chart — ticket count per priority level */}
        <BarChartComponent
          data={priorityData}
          isRTL={isRTL}
          title={t(
            "analyticsMenu.charts.ticketsByPriority",
            "Tickets by Priority",
          )}
          xDataKey="name"
          yDataKey="value"
          barColor="#eab308"
          originalNames={originalPriorityNames}
        />

        {/* Multi-bar chart — for each priority, show breached vs total side by side */}
        <MultiBarChartComponent
          data={breachData}
          isRTL={isRTL}
          title={t(
            "analyticsMenu.charts.slaBreachesByPriority",
            "SLA Breaches by Priority",
          )}
          xDataKey="name"
          originalNames={originalBreachPriorityNames}
          bars={[
            {
              dataKey: "breached",
              fill: "#ef4444", // Red for breached tickets
              name: t("analyticsMenu.charts.breached", "Breached"),
            },
            {
              dataKey: "total",
              fill: "#3b82f6", // Blue for total tickets
              name: t("analyticsMenu.charts.total", "Total"),
            },
          ]}
        />

        {/* Bar chart — ticket count per category */}
        <BarChartComponent
          data={categoryData}
          isRTL={isRTL}
          title={t(
            "analyticsMenu.charts.ticketsByCategory",
            "Tickets by Category",
          )}
          xDataKey="category"
          yDataKey="count"
          barColor="#eab308" // Yellow
        />
      </div>

      {/* ── AGENT PERFORMANCE TABLE */} 
      <AgentPerformanceTable //AG GRID TABLE
        agentPerformance={stats.agentPerformance}
        isRTL={isRTL}
        t={t}
      />

      {/*  BOTTOM INFO CARDS (3 cards in a row) */}
      {/* Each InfoMetricCard shows a list of label + value + icon rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-8"> 
        {/* Card 1: Resolution Metrics */}
        <InfoMetricCard
          icon={Target}
          title={t(
            "analyticsMenu.additionalMetrics.resolutionMetrics",
            "Resolution Metrics",
          )}
          items={[
            {
              label: t(
                "analyticsMenu.additionalMetrics.avgResolutionTime",
                "Avg Resolution Time",
              ),
              value: (() => {
                // Same hours/minutes formatting logic as the top metric card
                const totalHours = stats.resolutionMetrics.avgResolutionTime;
                const hours = Math.floor(totalHours);
                const minutes = Math.round((totalHours - hours) * 60);
                return minutes > 0
                  ? `${hours}${t("analyticsMenu.metrics.hours", "h")} ${minutes}${t("analyticsMenu.metrics.minutes", "m")}`
                  : `${hours}${t("analyticsMenu.metrics.hours", "h")}`;
              })(),
              icon: Clock,
              color: "text-blue-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.closedThisMonth",
                "Closed This Month",
              ),
              value:
                stats.resolutionMetrics.closedThisMonth.toLocaleString("en-US"),
              icon: CheckCircle,
              color: "text-green-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.openTickets",
                "Open Tickets",
              ),
              value:
                stats.resolutionMetrics.openTickets.toLocaleString("en-US"),
              icon: MailOpen,
              color: "text-orange-600",
            },
          ]}
          isRTL={isRTL}
        />

        {/* Card 2: SLA Metrics */}
        <InfoMetricCard
          icon={ShieldAlert}
          title={t("analyticsMenu.additionalMetrics.slaMetrics", "SLA Metrics")}
          items={[
            {
              label: t(
                "analyticsMenu.additionalMetrics.complianceRate",
                "Compliance Rate",
              ),
              value: `${stats.slaMetrics.complianceRate.toFixed(1)}%`,
              icon: CheckCheck,
              color: "text-green-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.totalBreaches",
                "Total Breaches",
              ),
              value: stats.slaMetrics.totalBreaches.toLocaleString("en-US"),
              icon: ShieldAlert,
              color: "text-red-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.criticalBreaches",
                "Critical Breaches",
              ),
              value: stats.slaMetrics.criticalBreaches.toLocaleString("en-US"),
              icon: ShieldX,
              color: "text-red-600",
            },
          ]}
          isRTL={isRTL}
        />

        {/* Card 3: Workload Distribution */}
        <InfoMetricCard
          icon={Users}
          title={t(
            "analyticsMenu.additionalMetrics.workloadDistribution",
            "Workload Distribution",
          )}
          items={[
            {
              label: t(
                "analyticsMenu.additionalMetrics.newTickets",
                "New Tickets",
              ),
              value:
                stats.workloadDistribution.newTickets.toLocaleString("en-US"),
              icon: TicketPlus,
              color: "text-purple-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.underProcess",
                "Under Process",
              ),
              value:
                stats.workloadDistribution.underProcess.toLocaleString("en-US"),
              icon: Loader2,
              color: "text-blue-600",
            },
            {
              label: t(
                "analyticsMenu.additionalMetrics.pendingResponse",
                "Pending Response",
              ),
              value:
                stats.workloadDistribution.pendingResponse.toLocaleString(
                  "en-US",
                ),
              icon: ClockAlert,
              color: "text-yellow-600",
            },
          ]}
          isRTL={isRTL}
        />
      </div>
    </AdminLayout>
  );
}

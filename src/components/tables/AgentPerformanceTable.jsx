import React from "react";
import TableHeader from "@ui/TableHeader";

/**
 * AgentPerformanceTable - A reusable component for displaying agent performance data
 * 
 * @param {Object} props
 * @param {Array} props.agentPerformance - Array of agent performance data objects
 * @param {boolean} props.isRTL - Whether the table should be displayed in RTL mode
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const AgentPerformanceTable = ({ agentPerformance, isRTL, t }) => {
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "", isRTL) =>
    `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
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
                {t("analyticsMenu.agentPerformance.agentName", "Agent Name")}
              </TableHeader>
              <TableHeader isRTL={isRTL}>
                {t("analyticsMenu.agentPerformance.ticketsHandled", "Tickets Handled")}
              </TableHeader>
              <TableHeader isRTL={isRTL}>
                {t("analyticsMenu.agentPerformance.avgResponseTime", "Avg Response Time (hrs)")}
              </TableHeader>
              <TableHeader isRTL={isRTL}>
                {t("analyticsMenu.agentPerformance.avgResolutionTime", "Avg Resolution Time (hrs)")}
              </TableHeader>
              <TableHeader isRTL={isRTL}>
                {t("analyticsMenu.agentPerformance.slaBreaches", "SLA Breaches")}
              </TableHeader>
              <TableHeader isRTL={isRTL}>
                {t("analyticsMenu.agentPerformance.performance", "Performance")}
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {agentPerformance.map((agent, index) => {
              // Calculate breach rate and performance grade
              const breachRate =
                agent.tickets_handled > 0
                  ? (agent.breached_count / agent.tickets_handled) * 100
                  : 0;
              
              const performanceGrade =
                breachRate < 10
                  ? t("analyticsMenu.agentPerformance.excellent", "Excellent")
                  : breachRate < 20
                  ? t("analyticsMenu.agentPerformance.good", "Good")
                  : t("analyticsMenu.agentPerformance.needsImprovement", "Needs Improvement");
              
              const gradeColor =
                breachRate < 10
                  ? "text-green-600"
                  : breachRate < 20
                  ? "text-yellow-600"
                  : "text-red-600";
              
              // Format agent name for translation
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
  );
};

export default AgentPerformanceTable;

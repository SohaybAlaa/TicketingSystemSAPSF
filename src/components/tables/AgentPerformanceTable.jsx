import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { myTheme } from "@utils/agGridThemes";

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * AgentPerformanceTable - AG Grid-based component for displaying agent performance data
 * 
 * @param {Object} props
 * @param {Array} props.agentPerformance - Array of agent performance data objects
 * @param {boolean} props.isRTL - Whether the table should be displayed in RTL mode
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const AgentPerformanceTable = ({ agentPerformance, isRTL, t }) => {
  // Ensure agentPerformance is an array
  const validData = Array.isArray(agentPerformance) ? agentPerformance : [];

  const columnDefs = useMemo(
    () => [
      {
        field: "agent_name",
        headerName: t("analyticsMenu.agentPerformance.agentName", "Agent Name"),
        flex: 1,
        minWidth: 150,
        cellRenderer: (params) => {
          if (!params.value) return "";
          const agentNameKey = params.value
            .toLowerCase()
            .replace(/\s+/g, "_");
          return t(`analyticsMenu.agents.${agentNameKey}`, params.value);
        },
      },
      {
        field: "tickets_handled",
        headerName: t("analyticsMenu.agentPerformance.ticketsHandled", "Tickets Handled"),
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => params.value?.toLocaleString("en-US") || "0",
      },
      {
        field: "under_process",
        headerName: t("analyticsMenu.agentPerformance.underProcess", "Under Process"),
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => params.value?.toLocaleString("en-US") || "0",
      },
      {
        field: "avg_resolution_time",
        headerName: t("analyticsMenu.agentPerformance.avgResolutionTime", "Avg Resolution Time"),
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) => {
          if (params.value == null || params.value === 0) return "N/A";
          const totalHours = Number(params.value);
          const hours = Math.floor(totalHours);
          const minutes = Math.round((totalHours - hours) * 60);
          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        },
      },
      {
        field: "breached_count",
        headerName: t("analyticsMenu.agentPerformance.slaBreaches", "SLA Breaches"),
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => params.value?.toLocaleString("en-US") || "0",
        cellStyle: (params) => {
          if (params.value > 0) {
            return { color: "#dc2626", fontWeight: "bold" };
          }
          return { fontWeight: "bold" };
        },
      },
      {
        field: "performance",
        headerName: t("analyticsMenu.agentPerformance.performance", "Performance"),
        flex: 1,
        minWidth: 130,
        valueGetter: (params) => {
          const breachRate =
            params.data.tickets_handled > 0
              ? (params.data.breached_count / params.data.tickets_handled) * 100
              : 0;
          return breachRate < 10
            ? t("analyticsMenu.agentPerformance.excellent", "Excellent")
            : breachRate < 20
            ? t("analyticsMenu.agentPerformance.good", "Good")
            : t("analyticsMenu.agentPerformance.needsImprovement", "Needs Improvement");
        },
        cellStyle: (params) => {
          const breachRate =
            params.data.tickets_handled > 0
              ? (params.data.breached_count / params.data.tickets_handled) * 100
              : 0;
          const color =
            breachRate < 10
              ? "#16a34a"
              : breachRate < 20
              ? "#ca8a04"
              : "#dc2626";
          return { color, fontWeight: "bold" };
        },
      },
    ],
    [t]
  );

  const rowData = useMemo(() => validData, [validData]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {t("analyticsMenu.agentPerformance.title", "Agent Performance")}
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2"></div>
      </div>
      <div style={{ height: "367px", width: "100%" }}>
        <AgGridReact
          theme={myTheme}
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={5}
          suppressPaginationPanel={false}
          enableRtl={isRTL}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
        />
      </div>
    </div>
  );
};

export default AgentPerformanceTable;

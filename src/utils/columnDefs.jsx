import { STATUS_ORDER, PRIORITY_ORDER } from "../data/mockData";
import { 
  getPriorityColorStyles, 
  getStatusColorStyles, 
  isSLAOverdue 
} from "../utils/helpers";
import ActionCellRenderer from "../components/grid/ActionCellRenderer";

/**
 * Get AG Grid column definitions
 * @param {function} handleStatusChange - Callback for status changes
 * @param {function} handlePriorityChange - Callback for priority changes
 * @param {function} handleDeleteTicket - Callback for delete action
 * @param {function} handleAssignToMe - Callback for assign to me
 * @param {function} handleAssignToOther - Callback for assign to other
 */
export const getColumnDefs = (
  handleStatusChange,
  handlePriorityChange,
  handleDeleteTicket,
  handleAssignToMe,
  handleAssignToOther
) => [
  {
    field: "ticketId",
    headerName: "Ticket ID",
    filter: "agTextColumnFilter",
    tooltipField: "ticketId",
  },
  {
    field: "title",
    headerName: "Title",
    filter: "agTextColumnFilter",
    tooltipField: "title",
  },
  { 
    field: "employee", 
    headerName: "Employee", 
    filter: "agTextColumnFilter" 
  },
  {
    field: "category",
    headerName: "Category",
    filter: "agTextColumnFilter",
    tooltipField: "category",
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 120,
    filter: "agTextColumnFilter",
    comparator: (valueA, valueB) =>
      PRIORITY_ORDER[valueA] - PRIORITY_ORDER[valueB],
    filterParams: {
      comparator: (a, b) => PRIORITY_ORDER[a] - PRIORITY_ORDER[b],
    },
    cellStyle: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      const colors = getPriorityColorStyles(params.value);

      return (
        <span
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: "9999px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "600",
            display: "block",
            lineHeight: "normal",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </span>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 170,
    filter: "agTextColumnFilter",
    comparator: (valueA, valueB) => STATUS_ORDER[valueA] - STATUS_ORDER[valueB],
    filterParams: {
      comparator: (a, b) => STATUS_ORDER[a] - STATUS_ORDER[b],
    },
    cellStyle: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      const colors = getStatusColorStyles(params.value);

      return (
        <span
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: "9999px",
            padding: "4px 8px",
            fontSize: "12px",
            fontWeight: "600",
            display: "block",
            lineHeight: "normal",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </span>
      );
    },
  },
  {
    field: "assignedTo",
    headerName: "Assigned To",
    filter: "agTextColumnFilter",
    minWidth: 170,
  },
  {
    field: "created",
    headerName: "Created",
    filter: "agDateColumnFilter",
  },
  {
    field: "slaDue",
    headerName: "SLA Due",
    width: 150,
    filter: "agDateColumnFilter",
    cellStyle: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      const isOverdue = isSLAOverdue(params.data.created);
      const isCompleted =
        params.data.status === "Completed" || params.data.status === "Closed";

      if (isOverdue && !isCompleted) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              lineHeight: "1.2",
            }}
          >
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {params.value}
            </span>
            <span style={{ color: "#FF2C2C" }}>OVERDUE</span>
          </div>
        );
      }

      return (
        <span style={{ fontSize: "13px", color: "#374151" }}>
          {params.value}
        </span>
      );
    },
  },
  {
    field: "action",
    headerName: "Action",
    maxWidth: 105,
    cellStyle: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
    },
    cellRenderer: (params) => (
      <ActionCellRenderer
        data={params.data}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onDelete={handleDeleteTicket}
        onAssignToMe={handleAssignToMe}
        onAssignToOther={handleAssignToOther}
      />
    ),
  },
];

export const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
};

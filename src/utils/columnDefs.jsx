import { isSLAOverdue } from "../utils/helpers";
import Tag from "@components/ui/Tag";
import ActionCellRenderer from "../components/grid/ActionCellRenderer";

/**
 * Get AG Grid column definitions
 * @param {function} handleStatusChange - Callback for status changes
 * @param {function} handlePriorityChange - Callback for priority changes
 * @param {function} handleDeleteTicket - Callback for delete action
 * @param {function} handleAssignToMe - Callback for assign to me
 * @param {function} handleAssignToOther - Callback for assign to other
 * @param {function} t - Translation function from i18next
 */

// Status order for sorting
const STATUS_ORDER = {
  "Pending Employee": 1,
  "Pending ThirdParty": 2,
  "Under Process": 3,
  New: 4,
  Completed: 5,
  Closed: 6,
};

// Priority order for sorting
const PRIORITY_ORDER = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

export const getColumnDefs = (
  handleStatusChange,
  handlePriorityChange,
  handleDeleteTicket,
  handleAssignToMe,
  handleAssignToOther,
  t, // Translation function parameter
  isRTL = false // RTL layout parameter
) => [
  {
    field: "ticketId",
    headerName: t("ticketsPage.columns.ticketId"),
    filter: "agTextColumnFilter",
    tooltipField: "ticketId",
    maxWidth: 130,
  },
  {
    field: "title",
    headerName: t("ticketsPage.columns.title"),
    filter: "agTextColumnFilter",
    tooltipField: "title",
  },
  {
    field: "employee",
    headerName: t("ticketsPage.columns.employee"),
    filter: "agTextColumnFilter",
    valueGetter: (params) => {
      const employeeName = params.data.employee;
      return t(`employees.${employeeName}`, employeeName);
    },
  },
  {
    field: "category",
    headerName: t("ticketsPage.columns.category"),
    filter: "agTextColumnFilter",
    tooltipField: "category",
    valueGetter: (params) => {
      const category = params.data.category;
      return t(`categories.${category}`, category);
    },
  },
  {
    field: "priority",
    headerName: t("ticketsPage.columns.priority"),
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
      return (
        <Tag 
          type="priority" 
          value={params.value} 
          t={t}
          isRTL={isRTL}
          className="w-full"
        />
      );
    },
  },
  {
    field: "status",
    headerName: t("ticketsPage.columns.status"),
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
      return (
        <Tag 
          type="status" 
          value={params.value} 
          t={t}
          isRTL={isRTL}
          className="w-full"
        />
      );
    },
  },
  {
    field: "assignedTo",
    headerName: t("ticketsPage.columns.assignedTo"),
    filter: "agTextColumnFilter",
    minWidth: 170,
    valueGetter: (params) => {
      const assignedTo = params.data.assignedTo;
      // Try teamMembers first, then employees, fallback to original value
      const translated = t(
        `teamMembers.${assignedTo}`,
        t(`employees.${assignedTo}`, assignedTo)
      );
      return translated;
    },
  },
  {
    field: "created",
    headerName: t("ticketsPage.columns.created"),
    filter: "agDateColumnFilter",
  },
  {
    field: "slaDue",
    headerName: t("ticketsPage.columns.slaDue"),
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
            <span style={{ color: "#FF2C2C" }}>
              {t("ticketsPage.sla.overdue")}
            </span>
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
    headerName: t("ticketsPage.columns.action"),
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

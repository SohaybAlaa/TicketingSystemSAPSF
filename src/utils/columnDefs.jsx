import { isSLAOverdue } from "../utils/helpers";
import Tag from "@components/ui/Tag";
import ActionCellRenderer from "../components/grid/ActionCellRenderer";
import { SkeletonBar } from "@components/ui/GridSkeleton";
import { formatDate, formatDateTime } from "@utils/dateUtils";

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
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
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
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return params.value;
    },
  },
  {
    field: "title",
    headerName: t("ticketsPage.columns.title"),
    filter: "agTextColumnFilter",
    tooltipField: "title",
    valueGetter: (params) => {
      if (params.data?._skeleton) return '';
      const title = params.data.title;
      return t(`ticketTitles.${title}`, title);
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return params.value;
    },
  },
  {
    field: "employee",
    headerName: t("ticketsPage.columns.employee"),
    filter: "agTextColumnFilter",
    valueGetter: (params) => {
      if (params.data?._skeleton) return '';
      const employeeName = params.data.employee;
      return t(`employees.${employeeName}`, employeeName);
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return params.value;
    },
  },
  {
    field: "category",
    headerName: t("ticketsPage.columns.category"),
    filter: "agTextColumnFilter",
    tooltipField: "category",
    valueGetter: (params) => {
      if (params.data?._skeleton) return '';
      const category = params.data.category;
      return t(`categories.${category}`, category);
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return params.value;
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
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />;
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
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />;
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
      if (params.data?._skeleton) return '';
      const assignedTo = params.data.assignedTo;
      // Try teamMembers first, then employees, fallback to original value
      const translated = t(
        `teamMembers.${assignedTo}`,
        t(`employees.${assignedTo}`, assignedTo)
      );
      return translated;
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return params.value;
    },
  },
  {
    field: "created",
    headerName: t("ticketsPage.columns.created"),
    filter: "agDateColumnFilter",
    // The "created" field itself is a pre-formatted display string (e.g. "Jul 13, 2026"), so
    // sorting on it directly compares text, not time (e.g. "Aug 5, 2026" < "Jul 13, 2026"
    // alphabetically, even though July comes first). Sort by the raw timestamp instead.
    comparator: (valueA, valueB, nodeA, nodeB) => {
      const a = nodeA?.data?.createdAt ? new Date(nodeA.data.createdAt).getTime() : 0;
      const b = nodeB?.data?.createdAt ? new Date(nodeB.data.createdAt).getTime() : 0;
      return a - b;
    },
    filterParams: {
      comparator: (filterDate, cellValue) => {
        if (!cellValue) return -1;
        const cellDate = new Date(cellValue);
        cellDate.setHours(0, 0, 0, 0);
        if (cellDate < filterDate) return -1;
        if (cellDate > filterDate) return 1;
        return 0;
      },
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} />;
      return formatDate(params.value);
    },
  },
  {
    field: "slaDue",
    headerName: t("ticketsPage.columns.slaDue"),
    width: 150,
    filter: "agDateColumnFilter",
    // Same issue as "created": slaDue is a pre-formatted display string, so the default
    // sort would compare text, not time. Sort by the raw timestamp instead.
    comparator: (valueA, valueB, nodeA, nodeB) => {
      const a = nodeA?.data?.slaDeadlineAt ? new Date(nodeA.data.slaDeadlineAt).getTime() : 0;
      const b = nodeB?.data?.slaDeadlineAt ? new Date(nodeB.data.slaDeadlineAt).getTime() : 0;
      return a - b;
    },
    filterParams: {
      comparator: (filterDate, cellValue) => {
        if (!cellValue) return -1;
        const cellDate = new Date(cellValue);
        cellDate.setHours(0, 0, 0, 0);
        if (cellDate < filterDate) return -1;
        if (cellDate > filterDate) return 1;
        return 0;
      },
    },
    cellStyle: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />;
      const slaDeadline = params.data.slaDue;
      const now = new Date();
      const deadlineDate = slaDeadline ? new Date(slaDeadline) : null;
      const isOverdue = deadlineDate && now > deadlineDate;
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
              {formatDateTime(slaDeadline)}
            </span>
            <span style={{ color: "#FF2C2C" }}>
              {t("ticketsPage.sla.overdue")}
            </span>
          </div>
        );
      }

      return (
        <span style={{ fontSize: "13px", color: "#374151" }}>
          {formatDateTime(slaDeadline)}
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
    cellRenderer: (params) => {
      if (params.data?._skeleton) return <SkeletonBar rowIndex={params.node?.rowIndex ?? 0} centered />;
      return (
      <ActionCellRenderer
        data={params.data}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onDelete={handleDeleteTicket}
        onAssignToMe={handleAssignToMe}
        onAssignToOther={handleAssignToOther}
      />
      );
    },
  },
];

export const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
};

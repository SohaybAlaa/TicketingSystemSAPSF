import { useParams, useNavigate } from "react-router-dom";
import React, { StrictMode, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { createRoot } from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Tickets() {
  const adminId = "EmadOmar";
  const navigate = useNavigate();

  const [menuopen, setMenuopen] = useState(false);

  // Helper function to check if SLA is overdue (more than 72 hours)
  const isSLAOverdue = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60); // Convert milliseconds to hours
    return hoursDiff > 72;
  };

  const [quickFilterText, setQuickFilterText] = useState("");

  // The actual row data
  const [rowData, setRowData] = useState([
    {
      ticketId: "TKT-001",
      title: "Incorrect salary amount in November payslip",
      category: "Payroll & Benefits",
      employee: "John Smith",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 9, 2025",
      slaDue: "Dec 12, 11:02 AM",
    },
    {
      ticketId: "TKT-002",
      title: "Unable to access HR portal",
      category: "IT Access",
      employee: "Anna Williams",
      department: "Marketing",
      priority: "CRITICAL",
      status: "New",
      assignedTo: "Sarah Johnson",
      created: "Dec 11, 2025",
      slaDue: "Dec 11, 07:02 PM",
    },
    {
      ticketId: "TKT-003",
      title: "Request for 3 days sick leave",
      category: "Leave & Attendance",
      employee: "Robert Brown",
      department: "Sales",
      priority: "MEDIUM",
      status: "Pending Employee",
      assignedTo: "Michael Chen",
      created: "Dec 10, 2025",
      slaDue: "Dec 13, 05:02 PM",
    },
    {
      ticketId: "TKT-004",
      title: "Questions about health insurance coverage",
      category: "Payroll & Benefits",
      employee: "Maria Garcia",
      department: "Finance",
      priority: "LOW",
      status: "Completed",
      assignedTo: "Sarah Johnson",
      created: "Dec 6, 2025",
      slaDue: "Dec 11, 05:02 PM",
    },
    {
      ticketId: "TKT-005",
      title: "Performance review document not accessible",
      category: "Performance",
      employee: "James Wilson",
      department: "Operations",
      priority: "MEDIUM",
      status: "Pending ThirdParty",
      assignedTo: "Michael Chen",
      created: "Dec 8, 2025",
      slaDue: "Dec 12, 05:02 AM",
    },
    {
      ticketId: "TKT-006",
      title: "Vacation leave approval pending for 2 weeks",
      category: "Leave & Attendance",
      employee: "Jennifer Lee",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Nov 27, 2025",
      slaDue: "Nov 28, 05:02 PM",
    },
    {
      ticketId: "TKT-007",
      title: "Remote work policy clarification",
      category: "Policy Questions",
      employee: "Christopher Davis",
      department: "HR",
      priority: "LOW",
      status: "Closed",
      assignedTo: "Emily Rodriguez",
      created: "Dec 1, 2025",
      slaDue: "Dec 6, 05:02 PM",
    },
    {
      ticketId: "TKT-008",
      title: "Password reset for benefits portal",
      category: "IT Access",
      employee: "John Smith",
      department: "Engineering",
      priority: "CRITICAL",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 11, 2025",
      slaDue: "Dec 11, 08:02 PM",
    },
  ]);

  // Dynamically calculate the total number of tickets
  const totalTickets = rowData.length;

  const [colDefs, setColDefs] = useState([
    { field: "ticketId", headerName: "ID" },
    { field: "title", headerName: "Title", width: 30 },
    { field: "employee", headerName: "Employee" },
    { field: "category", headerName: "Category" },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const getColorStyles = (priority) => {
          if (priority === "CRITICAL") {
            return { bg: "#fecaca", text: "#991b1b", border: "#f87171" };
          }
          if (priority === "HIGH") {
            return { bg: "#fed7aa", text: "#9a3412", border: "#fb923c" };
          }
          if (priority === "MEDIUM") {
            return { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa" };
          }
          return { bg: "#d1fae5", text: "#065f46", border: "#4ade80" };
        };

        const colors = getColorStyles(params.value);

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
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const getColorStyles = (status) => {
          switch (status) {
            case "Pending ThirdParty":
              return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
            case "Pending Employee":
              return { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" };
            case "Under Process":
              return { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" };
            case "New":
              return { bg: "#ede9fe", text: "#6d28d9", border: "#a78bfa" };
            case "Completed":
              return { bg: "#d1fae5", text: "#065f46", border: "#34d399" };
            case "Closed":
              return { bg: "#e5e7eb", text: "#4b5563", border: "#9ca3af" };
            default:
              return { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
          }
        };

        const colors = getColorStyles(params.value);

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
    { field: "assignedTo", headerName: "Assigned To" },
    {
      field: "slaDue",
      headerName: "SLA Due",
      width: 150,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        // Check if ticket is overdue (created more than 72 hours ago)
        const isOverdue = isSLAOverdue(params.data.created);

        // Skip overdue styling for completed/closed tickets
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
              <span
                style={{
                  color: "#FF2C2C",
                }}
              >
                OVERDUE
              </span>
            </div>
          );
        }

        // Normal display for non-overdue tickets
        return (
          <span style={{ fontSize: "13px", color: "#374151" }}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "action",
      headerName: "action",
      width: 50,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        return <EllipsisVertical />;
      },
    },
  ]);

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-slate-900 text-xl font-bold">Ticket Management</h1>
        <p className="text-slate-600 text-base mb-1">
          View and manage support tickets
        </p>
      </div>

      {/* Search Filter */}
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => setQuickFilterText(e.target.value)}
        className="border p-2 rounded mb-4 w-full "
      />

      {/* Ticket Count */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600 text-sm">
          Showing {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Ticket Table */}
      <div
        className="ag-theme-alpine"
        style={{ width: "100%", height: "400px" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
        />
      </div>
    </>
  );
}

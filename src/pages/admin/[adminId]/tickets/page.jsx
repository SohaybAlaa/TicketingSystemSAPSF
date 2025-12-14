import { ClientSideRowModelModule, QuickFilterModule, CellStyleModule, CsvExportModule } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { EllipsisVertical, Edit, Trash2, Eye, UserPlus, Download } from "lucide-react";


// Action Menu Component with Portal
function ActionMenu({ isOpen, onClose, position, onAction, ticketId }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: Eye, label: "View Details", action: "view" },
    { icon: Edit, label: "Edit Ticket", action: "edit" },
    { icon: UserPlus, label: "Reassign", action: "reassign" },
    { icon: Trash2, label: "Delete", action: "delete", danger: true },
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        minWidth: "180px",
        padding: "4px",
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onAction(item.action, ticketId);
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px 12px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "14px",
            color: item.danger ? "#dc2626" : "#374151",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = item.danger
              ? "#fee2e2"
              : "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

// Action Cell Renderer
function ActionCellRenderer({ data }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handleButtonClick = (e) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left - 150,
      });
    }

    setIsMenuOpen(!isMenuOpen);
  };

  const handleAction = (action, ticketId) => {
    switch (action) {
      case "view":
        alert(`Viewing ticket ${ticketId}`);
        break;
      case "edit":
        alert(`Editing ticket ${ticketId}`);
        break;
      case "reassign":
        alert(`Reassigning ticket ${ticketId}`);
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
          alert(`Deleting ticket ${ticketId}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <EllipsisVertical size={18} color="#6b7280" />
      </button>

      <ActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        position={menuPosition}
        onAction={handleAction}
        ticketId={data.ticketId}
      />
    </>
  );
}

export default function Tickets() {

  const isSLAOverdue = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff > 72;
  };

  const [quickFilterText, setQuickFilterText] = useState("");

  const gridRef = useRef(null);

  const handleExport = () => {
    if (gridRef.current) {
      const api = gridRef.current.api;
      api.exportDataAsCsv({ fileName: `${new Date().toISOString().split("T")[0]} Tickets Of ChatBot.csv` });
    }
  };

  const [rowData] = useState([
    {
      ticketId: "TKT-1001",
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
      ticketId: "TKT-1002",
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
      ticketId: "TKT-1003",
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
      ticketId: "TKT-1004",
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
      ticketId: "TKT-1005",
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
      ticketId: "TKT-1006",
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
      ticketId: "TKT-1007",
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
      ticketId: "TKT-1008",
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
    {
      ticketId: "TKT-1009",
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
      ticketId: "TKT-1010",
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
      ticketId: "TKT-1011",
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
      ticketId: "TKT-1012",
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
      ticketId: "TKT-1013",
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
      ticketId: "TKT-1014",
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
      ticketId: "TKT-1015",
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
      ticketId: "TKT-1016",
      title: "Password reset for benefits portal",
      category: "IT Access",
      employee: "John Smith",
      department: "Engineering",
      priority: "CRITICAL",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 14, 2025",
      slaDue: "Dec 14, 08:02 PM",
    },
  ]);


  const totalTickets = rowData.length;

  const statusOrder = {
    "Pending Employee": 1,
    "Pending ThirdParty": 2,
    "Under Process": 3,
    "New": 4,
    "Completed": 5,
    "Closed": 6,
  };

  const priorityOrder = {
    "CRITICAL": 1,
    "HIGH": 2,
    "MEDIUM": 3,
    "LOW": 4,
  };

  const [colDefs] = useState([
    { field: "ticketId", headerName: "ID" },
    { field: "title", headerName: "TITLE", width: 300 },
    { field: "employee", headerName: "EMPLOYEE" },
    { field: "category", headerName: "CATEGORY" },
    {
      field: "priority",
      headerName: "PRIORITY",
      width: 120,
      filter: 'agSetColumnFilter',
      comparator: (valueA, valueB) => priorityOrder[valueA] - priorityOrder[valueB],
      filterParams: {
        comparator: (a, b) => priorityOrder[a] - priorityOrder[b],
      },
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
      headerName: "STATUS",
      width: 170,
      filter: 'agSetColumnFilter',
      comparator: (valueA, valueB) => statusOrder[valueA] - statusOrder[valueB],
      filterParams: {
        comparator: (a, b) => statusOrder[a] - statusOrder[b],
      },
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
    { field: "assignedTo", headerName: "ASSIGNED TO" },
    {
      field: "slaDue",
      headerName: "SLA DUE",
      width: 150,
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
      headerName: "ACTION",
      width: 80,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      },
      cellRenderer: ActionCellRenderer,
    },
  ]);

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Management</h1>
            <p className="text-gray-600">View and manage support tickets</p>
          </div>
        </div>

        {/* Search & Export */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-md shadow"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Tickets Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600 text-sm ml-3">
            Showing {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table AG GRID */}
        <div
          className="ag-theme-alpine"
          style={{ width: "100%", height: "800px" }}
        >
          <AgGridReact
            ref={gridRef}
            modules={[ClientSideRowModelModule, QuickFilterModule, CellStyleModule, CsvExportModule]}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
          />
        </div>
      </div>
    </div>
  );
}
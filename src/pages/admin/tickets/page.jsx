import { AllCommunityModule } from "ag-grid-community";
import { myTheme } from "@utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { EllipsisVertical, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { checkAuth } from "@/utils/auth";

// Components
import AdminLayout from "@components/layouts/AdminLayout";
import AlertNotification from "@ui/AlertNotification";
import BulkActionsButton from "@ui/BulkActionsButton";
import TicketsCountDisplay from "@ui/TicketsCountDisplay";

// Data
import { INITIAL_TICKETS } from "@data/mockData";

// Utilities
import { getColumnDefs, defaultColDef } from "@utils/columnDefs";

export default function Tickets() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Key to force AG Grid rerender when language changes
  const [gridKey, setGridKey] = useState(0);

  // Selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState([]);

  // Notification alerts on top right (supports multiple stacked alerts)
  const [alerts, setAlerts] = useState([]);

  // Mockup Date for table
  const [rowData, setRowData] = useState(INITIAL_TICKETS);

  // Search Input
  const [quickFilterText, setQuickFilterText] = useState("");

  // Ticket rows count
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  // Bulk action modals
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkAssignToOtherModalOpen, setIsBulkAssignToOtherModalOpen] = useState(false);

  // Bulk menu button and position
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const bulkButtonRef = useRef(null);
  const [bulkMenuPosition, setBulkMenuPosition] = useState({ top: 0, left: 0 });

  const rowSelection = useMemo(() => {
    return {
      mode: "multiRow",
    };
  }, []);

  const gridRef = useRef(null);

  // Force AG Grid to reinitialize when language changes
  useEffect(() => {
    setGridKey((prev) => prev + 1);
    // Clear selections when language changes
    setSelectedRows([]);
  }, [i18n.language]);

  // Ag Grid callbacks row Selection
  const onSelectionChanged = () => {
    const rows = gridRef.current.api.getSelectedRows();
    setSelectedRows(rows);
  };

  // Ag Grid callbacks export CSV file
  const handleExport = () => {
    if (gridRef.current) {
      const api = gridRef.current.api;
      api.exportDataAsCsv({
        fileName: `${
          new Date().toISOString().split("T")[0]
        } Tickets Of ChatBot.csv`,
      });
    }
  };

  // Ag Grid callbacks filter changed
  const onFilterChanged = () => {
    if (gridRef.current?.api) {
      const count = gridRef.current.api.getDisplayedRowCount();
      setDisplayedRowCount(count);
    }
  };

  // Ag Grid callbacks grid ready initial displayed row count before filters
  const onGridReady = (params) => {
    const count = params.api.getDisplayedRowCount();
    setDisplayedRowCount(count);
  };

  // Total tickets count
  const totalTickets = rowData.length;

  // Logged-in admin user state
  const [user, setUser] = useState(null);

  // Fetch logged-in admin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await checkAuth();
        setUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Get translated admin name for display
  const adminName = user?.username 
    ? t(`usernames.${user.username}`, user.username) 
    : t("adminName");

  const showAlert = (type, message, title = "") => {
    const id = Date.now() + Math.random();
    const newAlert = { id, type, message, title };

    setAlerts((prev) => [...prev, newAlert]);

    setTimeout(() => {
      removeAlert(id);
    }, 4000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Single ticket actions
  const handleStatusChange = (newStatus, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, status: newStatus } : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.statusChanged", {
        status: t(`ticketsPage.statuses.${newStatus}`),
        ticketId,
      }),
      t("ticketsPage.alerts.statusUpdated")
    );
  };

  const handlePriorityChange = (newPriority, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, priority: newPriority } : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.priorityChanged", {
        priority: t(`ticketsPage.priorities.${newPriority}`),
        ticketId,
      }),
      t("ticketsPage.alerts.priorityUpdated")
    );
  };

  const handleAssignToMe = (ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, assignedTo: adminName } : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.assignedToMe", { ticketId, adminId: adminName }),
      t("ticketsPage.alerts.assignmentSuccessful")
    );
  };

  const handleAssignToOther = (memberName, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, assignedTo: memberName } : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.assignedToOther", { ticketId, memberName }),
      t("ticketsPage.alerts.assignmentSuccessful")
    );
  };

  const handleDeleteTicket = (ticketId) => {
    setRowData((prev) => prev.filter((row) => row.ticketId !== ticketId));
    showAlert(
      "success",
      t("ticketsPage.alerts.ticketDeletedMessage", { ticketId }),
      t("ticketsPage.alerts.ticketDeleted")
    );
  };

  // Bulk actions
  const handleBulkAssignToMe = () => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, assignedTo: adminName }
          : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkAssignedToMe", {
        count: selectedRows.length,
        adminId: adminName,
      }),
      t("ticketsPage.alerts.bulkAssignmentSuccessful")
    );
    setSelectedRows([]);
  };

  const handleBulkAssignToOther = (memberName) => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, assignedTo: memberName }
          : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkAssignedToOther", {
        count: selectedRows.length,
        memberName,
      }),
      t("ticketsPage.alerts.bulkAssignmentSuccessful")
    );
    setSelectedRows([]);
  };

  const handleBulkDelete = () => {
    const count = selectedRows.length;
    setRowData((prev) =>
      prev.filter((r) => !selectedRows.some((s) => s.ticketId === r.ticketId))
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkTicketsDeleted", { count }),
      t("ticketsPage.alerts.ticketsDeleted")
    );
    setSelectedRows([]);
  };

  const handleBulkStatusChange = (newStatus) => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, status: newStatus }
          : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkStatusChanged", {
        status: t(`ticketsPage.statuses.${newStatus}`),
        count: selectedRows.length,
      }),
      t("ticketsPage.alerts.bulkStatusUpdated")
    );
    setSelectedRows([]);
  };

  const handleBulkPriorityChange = (newPriority) => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, priority: newPriority }
          : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkPriorityChanged", {
        priority: t(`ticketsPage.priorities.${newPriority}`),
        count: selectedRows.length,
      }),
      t("ticketsPage.alerts.bulkPriorityUpdated")
    );
    setSelectedRows([]);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case "assignToMe":
        handleBulkAssignToMe();
        break;
      case "assignToOther":
        setIsBulkAssignToOtherModalOpen(true);
        break;
      case "changeStatus":
        setIsBulkStatusModalOpen(true);
        break;
      case "changePriority":
        setIsBulkPriorityModalOpen(true);
        break;
      case "delete":
        setIsBulkDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleBulkButtonClick = (e) => {
    e.stopPropagation();
    if (bulkButtonRef.current) {
      const rect = bulkButtonRef.current.getBoundingClientRect();
      setBulkMenuPosition({
        top: rect.bottom + 4,
        left: isRTL ? rect.left - 150 : rect.left - 150,
      });
    }
    setIsBulkMenuOpen(!isBulkMenuOpen);
  };

  const handleRowClick = (event) => {
    const ticketId = event.data.ticketId;
    window.open(`/admin/tickets/${ticketId}`, "_blank");
  };

  // Get column definitions with handlers and translation function
  const colDefs = getColumnDefs(
    handleStatusChange,
    handlePriorityChange,
    handleDeleteTicket,
    handleAssignToMe,
    handleAssignToOther,
    t, // Pass translation function
    isRTL // Pass RTL layout parameter
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      
      <AdminLayout
        title={t("ticketsPage.title")}
        subtitle={t("ticketsPage.subtitle")}
      >
        {/* Global Alert Notification - Supports Multiple Stacked Alerts */}
        <AlertNotification alerts={alerts} onClose={removeAlert} />

        {/* Search, Bulk Actions & Export */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              autoFocus
              placeholder={t("ticketsPage.search")}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="border p-2 rounded w-full border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              dir={isRTL ? "rtl" : "ltr"}
            />
            
            {/* Bulk Actions Button - Animated show/hide */}
            {selectedRows.length > 0 && (
              <BulkActionsButton
                selectedRows={selectedRows}
                bulkButtonRef={bulkButtonRef}
                handleBulkButtonClick={handleBulkButtonClick}
                isBulkMenuOpen={isBulkMenuOpen}
                setIsBulkMenuOpen={setIsBulkMenuOpen}
                bulkMenuPosition={bulkMenuPosition}
                handleBulkAction={handleBulkAction}
                isBulkStatusModalOpen={isBulkStatusModalOpen}
                setIsBulkStatusModalOpen={setIsBulkStatusModalOpen}
                isBulkPriorityModalOpen={isBulkPriorityModalOpen}
                setIsBulkPriorityModalOpen={setIsBulkPriorityModalOpen}
                isBulkDeleteModalOpen={isBulkDeleteModalOpen}
                setIsBulkDeleteModalOpen={setIsBulkDeleteModalOpen}
                isBulkAssignToOtherModalOpen={isBulkAssignToOtherModalOpen}
                setIsBulkAssignToOtherModalOpen={setIsBulkAssignToOtherModalOpen}
                handleBulkStatusChange={handleBulkStatusChange}
                handleBulkPriorityChange={handleBulkPriorityChange}
                handleBulkDelete={handleBulkDelete}
                handleBulkAssignToOther={handleBulkAssignToOther}
                isRTL={isRTL}
                t={t}
              />
            )}

            <button
              onClick={handleExport}
              className="action-button"
            >
              {t("ticketsPage.export")}
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Tickets count */}
        <TicketsCountDisplay
          quickFilterText={quickFilterText}
          displayedRowCount={displayedRowCount}
          totalTickets={totalTickets}
          isRTL={isRTL}
          t={t}
        />

        {/* Table AG GRID */}
        <div
          className="ag-theme-alpine mb-15"
          style={{ width: "100%", height: "800px", marginBottom: "2rem" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <AgGridReact
            key={gridKey}
            getRowStyle={() => ({ cursor: "pointer" })}
            rowSelection={rowSelection}
            getRowHeight={() => 48}
            ref={gridRef}
            modules={[AllCommunityModule]}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            gridOptions={{
              theme: myTheme,
              enableCellTextSelection: true,
              ensureDomOrder: true,
              enableRtl: isRTL, // Enable RTL for AG Grid
            }}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            onRowDoubleClicked={(event) => handleRowClick(event)}
            onFilterChanged={onFilterChanged}
            domLayout="autoHeight"
          />
        </div>
      </AdminLayout>
    </>
  );
}
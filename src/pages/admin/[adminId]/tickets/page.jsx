import { AllCommunityModule } from "ag-grid-community";
import { myTheme } from "../../../../utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { EllipsisVertical, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

// Components
import AlertNotification from "../../../../components/ui/AlertNotification";
import ActionMenu from "../../../../components/ui/ActionMenu";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";
import ChangeStatusModal from "../../../../components/modals/ChangeStatusModal";
import ChangePriorityModal from "../../../../components/modals/ChangePriorityModal";
import AssignToOtherModal from "../../../../components/modals/AssignToOtherModal";

// Data
import { INITIAL_TICKETS } from "../../../../data/mockData";

// Utilities
import { getColumnDefs, defaultColDef } from "../../../../utils/columnDefs";

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
  const [isBulkAssignToOtherModalOpen, setIsBulkAssignToOtherModalOpen] =
    useState(false);

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

  // Admin id HARDCODED - Mockup
  const adminId = "Emad Omar";

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
        row.ticketId === ticketId ? { ...row, assignedTo: adminId } : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.assignedToMe", { ticketId, adminId }),
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
          ? { ...row, assignedTo: adminId }
          : row
      )
    );
    showAlert(
      "success",
      t("ticketsPage.alerts.bulkAssignedToMe", {
        count: selectedRows.length,
        adminId,
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
    window.open(`/admin/${adminId}/tickets/${ticketId}`, "_blank");
  };

  // Get column definitions with handlers and translation function
  const colDefs = getColumnDefs(
    handleStatusChange,
    handlePriorityChange,
    handleDeleteTicket,
    handleAssignToMe,
    handleAssignToOther,
    t // Pass translation function
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Global Alert Notification - Supports Multiple Stacked Alerts */}
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("ticketsPage.title")}
            </h1>
            <p className="text-gray-600">{t("ticketsPage.subtitle")}</p>
          </div>
        </div>

        {/* Search & Export */}
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
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start"
            >
              {t("ticketsPage.export")}
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          {/* Left: Tickets count */}
          <p className={`text-gray-600 text-sm ${isRTL ? "mr-3" : "ml-3"}`}>
            {quickFilterText ? (
              <>
                {t("ticketsPage.showing")} {displayedRowCount}{" "}
                {t("ticketsPage.of")} {totalTickets}{" "}
                {totalTickets !== 1
                  ? t("ticketsPage.tickets")
                  : t("ticketsPage.ticket")}
              </>
            ) : (
              <>
                {t("ticketsPage.showing")} {totalTickets}{" "}
                {t("ticketsPage.tickets")}
              </>
            )}
          </p>

          {/* Right: Bulk Action button */}
          {selectedRows.length > 0 && (
            <div className="relative">
              <button
                ref={bulkButtonRef}
                onClick={handleBulkButtonClick}
                className="flex items-center justify-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start"
              >
                {t("ticketsPage.bulkActions", { count: selectedRows.length })}
                <EllipsisVertical size={16} />
              </button>

              <ActionMenu
                isOpen={isBulkMenuOpen}
                onClose={() => setIsBulkMenuOpen(false)}
                position={bulkMenuPosition}
                ticketId="BULK"
                onAction={(action) => {
                  handleBulkAction(action);
                  setIsBulkMenuOpen(false);
                }}
              />

              <ChangeStatusModal
                isOpen={isBulkStatusModalOpen}
                onClose={() => setIsBulkStatusModalOpen(false)}
                currentStatus={selectedRows[0]?.status || "New"}
                onSave={handleBulkStatusChange}
                ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
              />

              <ChangePriorityModal
                isOpen={isBulkPriorityModalOpen}
                onClose={() => setIsBulkPriorityModalOpen(false)}
                currentPriority={selectedRows[0]?.priority || "MEDIUM"}
                onSave={handleBulkPriorityChange}
                ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
              />

              <DeleteConfirmModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                ticketId=""
                count={selectedRows.length}
              />

              <AssignToOtherModal
                isOpen={isBulkAssignToOtherModalOpen}
                onClose={() => setIsBulkAssignToOtherModalOpen(false)}
                onSave={handleBulkAssignToOther}
                ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
              />
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}

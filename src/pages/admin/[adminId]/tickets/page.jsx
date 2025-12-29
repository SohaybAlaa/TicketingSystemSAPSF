import { AllCommunityModule } from "ag-grid-community";
import { myTheme } from "../../../../utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useMemo } from "react";
import { EllipsisVertical, Download } from "lucide-react";
// Components
import AlertNotification from "../../../../components/ui/AlertNotification";
import ActionMenu from "../../../../components/ui/ActionMenu";
import DeleteConfirmModal from "../../../../components/modals/DeleteConfirmModal";
import ChangeStatusModal from "../../../../components/modals/ChangeStatusModal";
import ChangePriorityModal from "../../../../components/modals/ChangePriorityModal";
import AssignToOtherModal from "../../../../components/modals/AssignToOtherModal";
// Data
import { INITIAL_TICKETS } from "../../../../data/mockData";
//utilities
import { getColumnDefs, defaultColDef } from "../../../../utils/columnDefs";

export default function Tickets() {
  //selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState([]);

  //notification alerts on top right (supports multiple stacked alerts)
  const [alerts, setAlerts] = useState([]);

  //mockup Date for table
  const [rowData, setRowData] = useState(INITIAL_TICKETS);

  // search Input
  const [quickFilterText, setQuickFilterText] = useState("");

  // ticket rows count
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
  // Ag Grid callbacks row Selecion
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

  //total tickets count
  const totalTickets = rowData.length;

  // admin id HARDCODED - Mockup
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
      `Status changed to ${newStatus} for ticket ${ticketId}`,
      "Status Updated"
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
      `Priority changed to ${newPriority} for ticket ${ticketId}`,
      "Priority Updated"
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
      `Ticket ${ticketId} assigned to ${adminId}`,
      "Assignment Successful"
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
      `Ticket ${ticketId} assigned to ${memberName}`,
      "Assignment Successful"
    );
  };

  const handleDeleteTicket = (ticketId) => {
    setRowData((prev) => prev.filter((row) => row.ticketId !== ticketId));
    showAlert(
      "success",
      `Ticket ${ticketId} has been deleted`,
      "Ticket Deleted"
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
      `${selectedRows.length} ticket(s) assigned to ${adminId}`,
      "Bulk Assignment Successful"
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
      `${selectedRows.length} ticket(s) assigned to ${memberName}`,
      "Bulk Assignment Successful"
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
      `${count} ticket(s) have been deleted`,
      "Tickets Deleted"
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
      `Status changed to ${newStatus} for ${selectedRows.length} ticket(s)`,
      "Status Updated"
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
      `Priority changed to ${newPriority} for ${selectedRows.length} ticket(s)`,
      "Priority Updated"
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
        left: rect.left - 150,
      });
    }
    setIsBulkMenuOpen(!isBulkMenuOpen);
  };

  const handleRowClick = (event) => {
    const ticketId = event.data.ticketId;
    window.open(`/admin/${adminId}/tickets/${ticketId}`, "_blank");
  };

  // Get column definitions with handlers
  const colDefs = getColumnDefs(
    handleStatusChange,
    handlePriorityChange,
    handleDeleteTicket,
    handleAssignToMe,
    handleAssignToOther
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
              Ticket Management
            </h1>
            <p className="text-gray-600">View and manage support tickets</p>
          </div>
        </div>

        {/* Search & Export */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="border p-2 rounded w-full border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start"
            >
              Export
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          {/* Left: Tickets count */}
          <p className="text-gray-600 text-sm ml-3">
            {quickFilterText ? (
              <>
                Showing {displayedRowCount} of {totalTickets} ticket
                {totalTickets !== 1 ? "s" : ""}
              </>
            ) : (
              <>Showing {totalTickets} tickets</>
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
                Actions ({selectedRows.length})
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
                ticketId={`${selectedRows.length} tickets`}
              />

              <ChangePriorityModal
                isOpen={isBulkPriorityModalOpen}
                onClose={() => setIsBulkPriorityModalOpen(false)}
                currentPriority={selectedRows[0]?.priority || "MEDIUM"}
                onSave={handleBulkPriorityChange}
                ticketId={`${selectedRows.length} tickets`}
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
                ticketId={`${selectedRows.length} tickets`}
              />
            </div>
          )}
        </div>

        {/* Table AG GRID */}
        <div
          className="ag-theme-alpine mb-15"
          style={{ width: "100%", height: "800px", marginBottom: "2rem" }}
        >
          <AgGridReact
            getRowStyle={() => ({ cursor: "pointer" })}
            rowSelection={rowSelection} // Controls row selection mode (single / multiple)
            getRowHeight={() => 48} // Sets fixed row height to 48px
            ref={gridRef} // Reference to access AG Grid API
            modules={[AllCommunityModule]} // Registers AG Grid community modules
            rowData={rowData} // Data rows displayed in the grid
            columnDefs={colDefs} // Column definitions (headers, fields, renderers)
            defaultColDef={defaultColDef} // Default settings applied to all columns
            quickFilterText={quickFilterText} // Global quick filter text
            pagination={true} // Enables pagination
            paginationPageSize={25} // Number of rows per page
            paginationPageSizeSelector={[10, 25, 50, 100]} // Page size dropdown options
            gridOptions={{
              // Additional grid configuration
              theme: myTheme, // Custom grid theme
              enableCellTextSelection: true, // Allows text selection in cells
              ensureDomOrder: true, // Keeps DOM order in sync for accessibility
            }}
            onGridReady={onGridReady} // Called when grid is initialized
            onSelectionChanged={onSelectionChanged} // Called when row selection changes
            onRowDoubleClicked={(event) => handleRowClick(event)} // Handles row double-click
            onFilterChanged={onFilterChanged} // Called when filters change
            domLayout="autoHeight" // Adjusts grid height based on content
          />
        </div>
      </div>
    </div>
  );
}

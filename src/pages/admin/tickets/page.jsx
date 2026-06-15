import { AllCommunityModule } from "ag-grid-community";
import { myTheme } from "@utils/agGridThemes";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { Download, Inbox, X, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { checkAuth } from "@/utils/auth";
import { buildGridOverlay, getRowStyle } from "@utils/agGridUtils.jsx";

// Components
import AdminLayout from "@components/layouts/AdminLayout";
import AlertNotification from "@ui/AlertNotification";
import BulkActionsButton from "@ui/BulkActionsButton";
import TicketsCountDisplay from "@ui/TicketsCountDisplay";
import AddTicketModal from "@components/modals/AddTicketModal";

// Utilities
import { getColumnDefs, defaultColDef } from "@utils/columnDefs";
import { SKELETON_ROWS } from "@components/ui/GridSkeleton";
import { MOCK_SLA_CONFIGURATIONS } from "@data/mockData";

export default function Tickets() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Key to force AG Grid rerender when language changes
  const [gridKey, setGridKey] = useState(0);

  // Selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState([]);

  // Notification alerts on top right (supports multiple stacked alerts)
  const [alerts, setAlerts] = useState([]);

  // Tickets data from database
  const [rowData, setRowData] = useState([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Processing state - prevents double-click on actions
  const [isProcessing, setIsProcessing] = useState(false);

  // URL search params for pre-filtering (e.g. ?filter=slaBreached)
  const [searchParams] = useSearchParams();

  // Active dashboard filter (e.g. assignedToMe, myTeamTickets, closed30Days)
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('filter') || "");

  // Search Input - always starts empty; active filter shown as chip inside the bar
  const [quickFilterText, setQuickFilterText] = useState("");

  // Add Ticket modal
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);

  // Derive categories + subcategory map from SLA Assignment data
  const { slaCategories, slaSubcategoryMap } = useMemo(() => {
    const map = {};
    for (const cfg of MOCK_SLA_CONFIGURATIONS) {
      const cat = cfg.supportCategory;
      const sub = cfg.subcategory;
      if (!map[cat]) map[cat] = new Set();
      map[cat].add(sub);
    }
    return {
      slaCategories: Object.keys(map),
      slaSubcategoryMap: Object.fromEntries(
        Object.entries(map).map(([k, v]) => [k, [...v]])
      ),
    };
  }, []);

  // Bulk action modals
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkAssignToOtherModalOpen, setIsBulkAssignToOtherModalOpen] = useState(false);

  // Bulk menu button and position
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const bulkButtonRef = useRef(null);
  const [bulkMenuPosition, setBulkMenuPosition] = useState({ top: 0, left: 0 });

  // Ticket rows count
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  // mount once
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
        fileName: `${new Date().toISOString().split("T")[0]
          } Tickets.csv`,
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


  // Apply data-level filters for dashboard card clicks
  const filteredRowData = useMemo(() => {
    if (!activeFilter || !user) return rowData;
    const now = new Date();
    switch (activeFilter) {
      case "assignedToMe":
        return rowData.filter((t) => String(t.assignedToId) === String(user.id) && t.status !== "Completed" && t.status !== "Closed");
      case "myTeamTickets":
        return rowData.filter((t) => t.department === user.team && t.status !== "Completed" && t.status !== "Closed");
      case "newTickets":
        return rowData.filter((t) => t.status === "New");
      case "underProcess":
        return rowData.filter((t) => t.status === "Under Process");
      case "slaBreached":
        return rowData.filter((t) => t.slaDue && t.slaDue !== "N/A" && new Date(t.slaDue) < now && t.status !== "Completed" && t.status !== "Closed");
      case "closed30Days":
        return rowData.filter((t) => t.status === "Completed" || t.status === "Closed");
      case "openTickets":
        return rowData.filter((t) => t.status !== "Completed" && t.status !== "Closed");
      default:
        return rowData;
    }
  }, [rowData, activeFilter, user]);

  // Total tickets count
  const totalTickets = filteredRowData.length;

  // Fetch tickets from database
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/public/tickets');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Get the JSON data from the response

        if (data.success && data.tickets) { // Check if the response is successful and contains tickets
          setRowData(data.tickets); // Set the tickets data in the state
        } else {
          showAlert('error', 'Failed to load tickets', 'Error');
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        showAlert("error", `Failed to fetch tickets: ${error.message}`, "Database Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Get translated admin name for display
  const adminName = user?.username
    ? t(`usernames.${user.username}`, user.username)
    : t("adminName");

  const showAlert = (type, message, title = "") => {
    const id = Date.now() + Math.random(); //unique id for each alert
    const newAlert = { id, type, message, title }; //create new alert object

    setAlerts((prev) => [...prev, newAlert]); //add new alert to the alerts array

    // Type-based auto-dismiss duration
    const durations = { success: 3000, warning: 5000, error: 7000 };
    const duration = durations[type] || 4000;

    setTimeout(() => {
      removeAlert(id);
    }, duration);
  };

  const removeAlert = (id) => { //remove alert from the alerts array
    setAlerts((prev) => prev.filter((alert) => alert.id !== id)); //filter out the alert with the given id
  };

  // Generic API request helper — DRY (DONT REPEAT YOURSELF) up all fetch calls
  const apiRequest = async (url, body) => {
    const response = await fetch(url, { // Fetch the API endpoint
      method: 'POST', // HTTP method
      headers: { 'Content-Type': 'application/json' }, // Content type
      body: JSON.stringify(body), // Request body
    });
    if (!response.ok) { // Check if the response is successful
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json(); // Get the JSON data from the response
    if (!data.success) { // Check if the response is successful
      throw new Error(data.error || t("ticketsPage.alerts.unknownError", "Unknown error"));
    }
    return data;
  };

  // Helper: clear grid selection via API + state
  const clearSelection = () => {
    setSelectedRows([]);
    if (gridRef.current?.api) {
      gridRef.current.api.deselectAll();
    }
  };

  // Helper: run operations with Promise.allSettled — works for both single and bulk
  const executeAction = async (rows, requestFn, { onSuccess, successMessage, successTitle, errorPrefix, isBulk = false }) => {
    if (isProcessing || rows.length === 0) return; // Check if the request is already processing or if there are no rows to process
    setIsProcessing(true); // Set the processing state to true

    try {
      const results = await Promise.allSettled( // Run all requests in parallel and wait for all to complete
        rows.map((row) => requestFn(row)) // Map each row to a request
      );

      const succeeded = results.filter((r) => r.status === "fulfilled"); // Filter out the fulfilled results
      const failed = results.filter((r) => r.status === "rejected"); // Filter out the rejected results
      const succeededIds = rows // Get the IDs of the succeeded rows
        .filter((_, i) => results[i].status === "fulfilled") // Filter out the fulfilled results
        .map((r) => r.ticketId); // Map each row to its ID

      // Apply UI update for succeeded items
      if (succeeded.length > 0 && onSuccess) { // Check if there are any succeeded rows and if there is an onSuccess callback
        onSuccess(succeededIds);
      }

      // Show appropriate alert based on results
      if (failed.length === 0) { // Check if there are no failed rows
        showAlert("success", successMessage(rows.length), successTitle);
      } else if (succeeded.length === 0) {
        showAlert("error",
          t("ticketsPage.alerts.bulkAllFailed", { count: rows.length, error: errorPrefix }),
          t("ticketsPage.alerts.bulkActionFailed", "Bulk Action Failed")
        );
      } else {
        // Partial success (only possible in bulk)
        showAlert("warning",
          t("ticketsPage.alerts.bulkPartialSuccess", {
            succeeded: succeeded.length,
            failed: failed.length,
            total: rows.length,
          }),
          t("ticketsPage.alerts.bulkPartialTitle", "Partial Success")
        );
      }

      if (isBulk) clearSelection();// clear selection after bulk action
    } catch (error) {
      console.error(`Action error:`, error);
      showAlert("error", `${errorPrefix}: ${error.message}`, t("ticketsPage.alerts.error", "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Unified handlers (single + bulk via optional ticketId)
  const handleStatusChange = (newStatus, ticketId) => {
    const isBulk = !ticketId; // Determine if the action is bulk or single
    const rows = ticketId ? [{ ticketId }] : selectedRows; // Get the rows to process

    executeAction(rows, (row) =>
      apiRequest('/api/public/tickets/status', { ticketId: row.ticketId, status: newStatus }),
      {
        onSuccess: (succeededIds) => {
          setRowData((prev) =>
            prev.map((r) =>
              succeededIds.includes(r.ticketId) ? { ...r, status: newStatus } : r
            )
          );
        },
        successMessage: (count) => isBulk
          ? t("ticketsPage.alerts.bulkStatusChanged", { status: t(`ticketsPage.statuses.${newStatus}`), count })
          : t("ticketsPage.alerts.statusChanged", { status: t(`ticketsPage.statuses.${newStatus}`), ticketId }),
        successTitle: t("ticketsPage.alerts.statusUpdated"),
        errorPrefix: t("ticketsPage.alerts.failedBulkStatus", "Failed to update status"),
        isBulk,
      }
    );
  };

  const handlePriorityChange = (newPriority, ticketId) => {
    const isBulk = !ticketId; //
    const rows = ticketId ? [{ ticketId }] : selectedRows;

    executeAction(rows, (row) =>
      apiRequest('/api/public/tickets/priority', { ticketId: row.ticketId, priority: newPriority }),
      {
        onSuccess: (succeededIds) => {
          setRowData((prev) =>
            prev.map((r) =>
              succeededIds.includes(r.ticketId) ? { ...r, priority: newPriority } : r
            )
          );
        },
        successMessage: (count) => isBulk
          ? t("ticketsPage.alerts.bulkPriorityChanged", { priority: t(`ticketsPage.priorities.${newPriority}`), count })
          : t("ticketsPage.alerts.priorityChanged", { priority: t(`ticketsPage.priorities.${newPriority}`), ticketId }),
        successTitle: t("ticketsPage.alerts.priorityUpdated"),
        errorPrefix: t("ticketsPage.alerts.failedBulkPriority", "Failed to update priority"),
        isBulk,
      }
    );
  };

  const handleAssignToMe = (ticketId) => {
    const isBulk = !ticketId;
    const rows = ticketId ? [{ ticketId }] : selectedRows;

    executeAction(rows, (row) =>
      apiRequest('/api/public/tickets/assign', {
        ticketId: row.ticketId,
        userId: user?.id || 1,
        userName: adminName,
        userEmail: user?.email || `${user?.username}@company.com`,
      }),
      {
        onSuccess: (succeededIds) => {
          setRowData((prev) =>
            prev.map((r) =>
              succeededIds.includes(r.ticketId) ? { ...r, assignedTo: adminName } : r
            )
          );
        },
        successMessage: (count) => isBulk
          ? t("ticketsPage.alerts.bulkAssignedToMe", { count, adminId: adminName })
          : t("ticketsPage.alerts.assignedToMe", { ticketId, adminId: adminName }),
        successTitle: t("ticketsPage.alerts.assignmentSuccessful"),
        errorPrefix: t("ticketsPage.alerts.failedBulkAssign", "Failed to assign tickets"),
        isBulk,
      }
    );
  };

  const handleAssignToOther = (memberName, ticketId) => {
    const isBulk = !ticketId;
    const rows = ticketId ? [{ ticketId }] : selectedRows;
    const memberEmail = `${memberName.toLowerCase().replace(' ', '.')}@company.com`;

    executeAction(rows, (row) =>
      apiRequest('/api/public/tickets/assign', {
        ticketId: row.ticketId,
        userId: null,
        userName: memberName,
        userEmail: memberEmail,
      }),
      {
        onSuccess: (succeededIds) => {
          setRowData((prev) =>
            prev.map((r) =>
              succeededIds.includes(r.ticketId) ? { ...r, assignedTo: memberName } : r
            )
          );
        },
        successMessage: (count) => isBulk
          ? t("ticketsPage.alerts.bulkAssignedToOther", { count, memberName })
          : t("ticketsPage.alerts.assignedToOther", { ticketId, memberName }),
        successTitle: t("ticketsPage.alerts.assignmentSuccessful"),
        errorPrefix: t("ticketsPage.alerts.failedBulkAssign", "Failed to assign tickets"),
        isBulk,
      }
    );
  };

  const handleDeleteTicket = (ticketId) => {
    const isBulk = !ticketId;
    const rows = ticketId ? [{ ticketId }] : selectedRows;

    executeAction(rows, (row) =>
      apiRequest('/api/public/tickets/delete', { ticketId: row.ticketId }),
      {
        onSuccess: (succeededIds) => {
          setRowData((prev) =>
            prev.filter((r) => !succeededIds.includes(r.ticketId))
          );
        },
        successMessage: (count) => isBulk
          ? t("ticketsPage.alerts.bulkTicketsDeleted", { count })
          : t("ticketsPage.alerts.ticketDeletedMessage", { ticketId }),
        successTitle: t("ticketsPage.alerts.ticketDeleted"),
        errorPrefix: t("ticketsPage.alerts.failedBulkDelete", "Failed to delete tickets"),
        isBulk,
      }
    );
  };

  const handleAddTicket = async (formData) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const { attachments, ...ticketFields } = formData;

      const data = await apiRequest('/api/public/tickets/create', {
        ...ticketFields,
        raisedById: user?.id || null,
        raisedByName: adminName || null,
        raisedByEmail: user?.email || `${user?.username}@company.com`,
      });

      if (data.success && data.ticket) {
        // Upload attachments (if any) after ticket is created
        if (attachments?.length) {
          const uploadResults = await Promise.allSettled(
            attachments.map(file =>
              fetch('/api/public/shared/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  filename: file.name,
                  content: file.base64,
                  uploadType: 'ticket',
                  ticketId: data.ticket.ticketId,
                  uploadedByType: 'hr_staff',
                  uploadedByName: adminName || 'HR Admin',
                  uploadedById: user?.id || null,
                }),
              })
            )
          );
          const failed = uploadResults.filter(r => r.status === 'rejected').length;
          if (failed > 0) {
            console.warn(`${failed} attachment(s) failed to upload for ticket ${data.ticket.ticketId}`);
          }
        }

        setRowData((prev) => [data.ticket, ...prev]);
        showAlert("success",
          t("ticketsPage.alerts.ticketCreated", { ticketId: data.ticket.ticketId }),
          t("ticketsPage.alerts.ticketCreatedTitle", "Ticket Created")
        );
        setIsAddTicketModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showAlert("error", `${t("ticketsPage.alerts.failedCreateTicket", "Failed to create ticket")}: ${error.message}`, t("ticketsPage.alerts.error", "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case "assignToMe":
        handleAssignToMe();       // no ticketId = bulk mode
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
            {/* Search input with optional active-filter chip inside */}
            <div
              className="flex items-center gap-2 border-2 border-yellow-400 rounded-lg px-2 w-full focus-within:ring-2 focus-within:ring-yellow-400 bg-white"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {activeFilter && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-300 rounded-full text-sm font-medium text-yellow-700 shadow-sm whitespace-nowrap transition-all duration-200 hover:bg-yellow-100">                  {activeFilter === "assignedToMe" && (isRTL ? "مُعيَّن لي" : "Assigned to Me")}
                  {activeFilter === "myTeamTickets" && (isRTL ? "تذاكر فريقي" : "My Team Tickets")}
                  {activeFilter === "newTickets" && (isRTL ? "تذاكر جديدة" : "New Tickets")}
                  {activeFilter === "underProcess" && (isRTL ? "قيد المعالجة" : "Under Process")}
                  {activeFilter === "slaBreached" && (isRTL ? "تجاوز SLA" : "SLA Breached")}
                  {activeFilter === "closed30Days" && (isRTL ? "مغلقة (30 يوم)" : "Closed (30 days)")}
                  <button onClick={() => setActiveFilter("")} className="ml-1 text-yellow-600 hover:text-yellow-900">
                    <X className="w-4 h-4  cursor-pointer" />
                  </button>
                </span>
              )}
              <input
                type="text"
                autoFocus
                placeholder={activeFilter ? "" : t("ticketsPage.search")}
                value={quickFilterText}
                onChange={(e) => { setQuickFilterText(e.target.value); setActiveFilter(""); }}
                className="flex-1 py-3 outline-none bg-transparent text-md"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            {/* Bulk Actions Button - Animated show/hide */}
            {selectedRows.length > 1 && (
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
                handleBulkStatusChange={(status) => handleStatusChange(status)}
                handleBulkPriorityChange={(priority) => handlePriorityChange(priority)}
                handleBulkDelete={() => handleDeleteTicket()}
                handleBulkAssignToOther={(name) => handleAssignToOther(name)}
                isRTL={isRTL}
                t={t}
              />
            )}

            <button
              onClick={() => setIsAddTicketModalOpen(true)}
              className="action-button"
            >
              {t("ticketsPage.addTicket", "Add Ticket")}
              <Plus size={16} />
            </button>

            <button
              onClick={handleExport}
              className="action-button"
            >
              {t("ticketsPage.export")}
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Add Ticket Modal */}
        <AddTicketModal
          isOpen={isAddTicketModalOpen}
          onClose={() => setIsAddTicketModalOpen(false)}
          onSave={handleAddTicket}
          isProcessing={isProcessing}
          categories={slaCategories}
          subcategoryMap={slaSubcategoryMap}
        />

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
          style={{ width: "100%", marginBottom: "2rem" }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <AgGridReact
            key={gridKey}
            getRowStyle={getRowStyle}
            rowSelection={isLoading ? undefined : rowSelection}
            getRowHeight={() => 48}
            headerHeight={52}
            suppressCellFocus
            ref={gridRef}
            modules={[AllCommunityModule]}
            rowData={isLoading ? SKELETON_ROWS : filteredRowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            quickFilterText={isLoading ? '' : quickFilterText}
            pagination={!isLoading}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            enableRtl={isRTL}
            gridOptions={{
              theme: myTheme,
              enableCellTextSelection: true,
              ensureDomOrder: true,
              overlayNoRowsTemplate: buildGridOverlay({
                icon: Inbox,
                heading: t("ticketsPage.noTicketsFound", "No tickets available"),
                sub: '',
              }),
            }}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            onRowDoubleClicked={(event) => {
              if (!event.data?._skeleton) handleRowClick(event);
            }}
            onFilterChanged={onFilterChanged}
            domLayout="autoHeight"
          />
        </div>
      </AdminLayout>
    </>
  );
}

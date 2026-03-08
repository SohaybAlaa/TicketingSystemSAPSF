import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Ticket,
  Copy,
  TicketCheck,
  Clock,
  User,
  AlertTriangle,
  UserCog,
  Repeat,
  FilePenLine,
} from "lucide-react";
import { formatDateTime } from "@utils/formatDateTime";
import Tag from "@components/ui/Tag";
import AlertNotification from "@ui/AlertNotification";
import TicketNotFound from "@components/ticketDetails/TicketNotFound";
import TicketLeftColumn from "@components/ticketDetails/TicketLeftColumnTabs/LeftColumnTabs";
import TicketRightColumn from "@components/ticketDetails/TicketRightColumnCards";

const VALID_FILE_TYPES = ["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Tickets({ ticketid }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // UI States
  const [alerts, setAlerts] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  // File Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [actualAttachments, setActualAttachments] = useState([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const fileInputRef = useRef(null);
  // Ticket Data States
  const [ticket, setTicket] = useState(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [apiComments, setApiComments] = useState([]);
  const [apiInternalNotes, setApiInternalNotes] = useState([]);
  const [localComments, setLocalComments] = useState([]);
  const [localNotes, setLocalNotes] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [localPriority, setLocalPriority] = useState("");

  // Combine API and Local Data
  const comments = [...apiComments, ...localComments];
  const internalNotes = [...apiInternalNotes, ...localNotes];

  // Fetch ticket data on component mount
  useEffect(() => {
    const fetchTicketData = async () => {
      setIsLoadingTicket(true);
      try {
        const response = await fetch(`/api/public/tickets/${ticketid}`);
        if (!response.ok) {
          throw new Error('Ticket not found');
        }
        const data = await response.json();
        if (data.success && data.ticket) {
          setTicket(data.ticket);
          setStatusHistory(data.statusHistory || []);
          setApiComments(data.comments || []);
          setApiInternalNotes(data.internalNotes || []);
        } else {
          setTicket(null);
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setTicket(null);
      } finally {
        setIsLoadingTicket(false);
      }
    };

    fetchTicketData();
    fetchAttachments();
  }, [ticketid]);

  // Sync local status/priority with ticket data
  useEffect(() => {
    setLocalStatus(ticket?.status || "");
    setLocalPriority(ticket?.priority || "");
  }, [ticket?.status, ticket?.priority]);

  // API FUNCTIONS
  const fetchAttachments = async () => {
    setIsLoadingAttachments(true);
    try {
      const response = await fetch(
        `/api/public/shared/list?listType=ticket&ticketId=${ticketid}`
      );
      if (!response.ok) throw new Error("Failed to fetch attachments");
      const data = await response.json();
      setActualAttachments(data.files || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      showAlert("error", t("ticketDetails.alerts.attachmentsFailed"));
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const closeDropdown = () => {
    requestAnimationFrame(() => {
      if (document?.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  };

  const isOverdue =
    (ticket?.sla_response_breached ?? false) ||
    (ticket?.sla_resolution_breached ?? false);

  const showAlert = (type, message, title = null) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, type, message, title };
    setAlerts((prev) => [...prev, newAlert]);
    setTimeout(() => removeAlert(id), 4000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleBack = () => {
    navigate(`/admin/tickets`);
  };

  // TICKET ACTION HANDLERS
  const handleCopyTicketId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ticket_id);
      setIsCopied(true);
      showAlert("success", t("ticketDetails.alerts.ticketIdCopied"));
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", t("ticketDetails.alerts.copyFailed"));
    }
  };

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
    closeDropdown();
    showAlert(
      "success",
      t("ticketDetails.alerts.statusUpdated", {
        status: t(`ticketsPage.statuses.${newStatus}`),
      })
    );
  };

  const handlePriorityChange = (newPriority) => {
    setLocalPriority(newPriority);
    closeDropdown();
    showAlert(
      "success",
      t("ticketDetails.alerts.priorityUpdated", {
        priority: t(`ticketsPage.priorities.${newPriority}`),
      })
    );
  };

  const handleUpdateTicket = async () => {
    try {
      // Check if status or priority has changed
      const statusChanged = localStatus !== ticket.status;
      const priorityChanged = localPriority !== ticket.priority;

      if (!statusChanged && !priorityChanged) {
        showAlert("info", t("ticketDetails.alerts.noChanges", "No changes to save"));
        return;
      }

      // Update status if changed
      if (statusChanged) {
        const statusResponse = await fetch('/api/public/tickets/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: ticketid,
            status: localStatus
          }),
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to update status');
        }
      }

      // Update priority if changed
      if (priorityChanged) {
        const priorityResponse = await fetch('/api/public/tickets/priority', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: ticketid,
            priority: localPriority
          }),
        });

        if (!priorityResponse.ok) {
          throw new Error('Failed to update priority');
        }
      }

      // Update local ticket state
      setTicket(prev => ({
        ...prev,
        status: localStatus,
        priority: localPriority
      }));

      showAlert(
        "success",
        t("ticketDetails.alerts.ticketUpdated", "Ticket updated successfully"),
        t("ticketDetails.alerts.updateSuccessful", "Update Successful")
      );

      // Navigate to tickets list after 1.5 second
      setTimeout(() => {
        navigate('/admin/tickets');
      }, 1500);
    } catch (error) {
      console.error('Error updating ticket:', error);
      showAlert(
        "error",
        t("ticketDetails.alerts.updateFailed", "Failed to update ticket"),
        t("ticketDetails.alerts.error", "Error")
      );
    }
  };

  // COMMENT HANDLERS
  const handleSendComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch('/api/public/tickets/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: ticketid,
            senderType: 'hr_staff',
            senderInfo: {
              hr_user_id: 1,
              hr_user_name: 'HR Admin',
              hr_user_email: 'hr@company.com',
              hr_department: 'HR Operations',
            },
            messageText: newComment,
          }),
        });

        if (!response.ok) throw new Error('Failed to send comment');

        const newCommentObj = {
          comment_id: `local-${Date.now()}`,
          ticket_id: ticketid,
          author_name: "HR Admin",
          author_type: "HR",
          department: "HR Operations",
          text: newComment,
          created_at: new Date().toISOString(),
        };
        setLocalComments((prev) => [...prev, newCommentObj]);
        setNewComment("");
        showAlert("success", t("ticketDetails.alerts.responseSent"));
      } catch (error) {
        console.error('Error sending comment:', error);
        showAlert("error", t("ticketDetails.alerts.responseFailed", "Failed to send response"));
      }
    }
  };

  // NOTE HANDLERS
  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const response = await fetch('/api/public/tickets/internal-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: ticketid,
            hrInfo: {
              hr_user_id: 1,
              hr_user_name: 'HR Admin',
              hr_user_email: 'hr@company.com',
              hr_department: 'HR Operations',
            },
            noteText: newNote,
          }),
        });

        if (!response.ok) throw new Error('Failed to add note');

        const newNoteObj = {
          note_id: `local-${Date.now()}`,
          ticket_id: ticketid,
          author_name: "HR Admin",
          department: "HR Operations",
          text: newNote,
          created_at: new Date().toISOString(),
        };
        setLocalNotes((prev) => [...prev, newNoteObj]);
        setNewNote("");
        showAlert("success", t("ticketDetails.alerts.noteAdded"));
      } catch (error) {
        console.error('Error adding note:', error);
        showAlert("error", t("ticketDetails.alerts.noteFailed", "Failed to add note"));
      }
    }
  };

  // FILE UPLOAD HANDLERS
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const fileType = file.name.split(".").pop().toLowerCase();

      // Validate file type
      if (!VALID_FILE_TYPES.includes(fileType)) {
        showAlert(
          "error",
          t("ticketDetails.alerts.invalidFileType", {
            filename: file.name,
            types: VALID_FILE_TYPES.join(", "),
          })
        );
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showAlert(
          "error",
          t("ticketDetails.alerts.fileTooLarge", {
            filename: file.name,
            maxSize: (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0),
          })
        );
        continue;
      }

      setIsUploading(true);

      try {
        // Convert file to base64
        const base64Content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            resolve(readerEvent.target.result.split(",")[1]);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });

        // Upload file to API
        const response = await fetch("/api/public/shared/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content: base64Content,
            uploadType: "ticket",
            ticketId: ticketid,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");

        showAlert(
          "success",
          t("ticketDetails.alerts.uploadSuccess", { filename: file.name })
        );
      } catch (error) {
        console.error("Upload error:", error);
        showAlert(
          "error",
          t("ticketDetails.alerts.uploadFailed", { filename: file.name })
        );
      } finally {
        setIsUploading(false);
      }
    }

    // Refresh attachments list and reset input
    await fetchAttachments();
    e.target.value = "";
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await fetch(
        `/api/public/shared/download?filename=${encodeURIComponent(
          attachment.filename
        )}&downloadType=ticket&ticketId=${ticketid}`
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.filename;
      a.click();
      window.URL.revokeObjectURL(url);

      showAlert(
        "success",
        t("ticketDetails.alerts.downloadSuccess", {
          filename: attachment.filename,
        })
      );
    } catch (error) {
      console.error("Download error:", error);
      showAlert("error", t("ticketDetails.alerts.downloadFailed"));
    }
  };

  // RENDER: LOADING STATE
  if (isLoadingTicket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
          <p className="text-gray-700 font-medium">{t("ticketsPage.loading", "Loading ticket...")}</p>
        </div>
      </div>
    );
  }

  // RENDER: TICKET NOT FOUND
  if (!ticket) {
    return <TicketNotFound handleBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Alert Notifications */}
      <AlertNotification alerts={alerts} onClose={removeAlert} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER SECTION */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-all duration-200"
          >
            <div className="p-1 rounded-lg group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            {t("ticketDetails.backToTickets")}
          </button>

          {/* Ticket Header Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Left Side: Ticket Info */}
              <div className="flex-1">
                {/* Ticket ID & Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <h1>
                      {t("ticketDetails.ticketId")} #{ticket.ticket_id}
                    </h1>
                    <button
                      onClick={handleCopyTicketId}
                      className="group p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                      title={t("ticketDetails.copyTicketId")}
                    >
                      {isCopied ? (
                        <TicketCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <Tag
                    type="status"
                    value={ticket.status}
                    t={t}
                    isRTL={false}
                  />

                  {/* Priority Badge */}
                  <Tag
                    type="priority"
                    value={ticket.priority}
                    t={t}
                    isRTL={false}
                  />

                  {/* SLA Breached Badge */}
                  {isOverdue && (
                    <div className="animate-pulse">
                      <Tag
                        type="status"
                        value="OVERDUE"
                        t={() => t("ticketDetails.slaBreached")}
                        isRTL={false}
                        icon={<AlertTriangle className="w-3.5 h-3.5" />}
                      />
                    </div>
                  )}
                </div>

                {/* Ticket Title */}
                <h2 className="mb-3">
                  {ticket.title}
                </h2>

                {/* Ticket Metadata */}
                <div className="flex flex-nowrap items-center gap-x-1 text-sm text-gray-600 overflow-x-auto">
                  <span className="flex items-center gap-1 !font-medium whitespace-nowrap">
                    <User className="w-3 h-3" />
                    {t("ticketDetails.employee")}:{" "}
                    {t(
                      `employees.${ticket.employee.name}`,
                      ticket.employee.name
                    )}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 !font-medium whitespace-nowrap">
                    <UserCog className="w-3 h-3" />
                    {t("ticketDetails.assignedTo")}:{" "}
                    {t(
                      `teamMembers.${ticket.assigned_user_name}`,
                      t(
                        `employees.${ticket.assigned_user_name}`,
                        ticket.assigned_user_name
                      )
                    )}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 !font-medium whitespace-nowrap cursor-default" title={`${t("ticketDetails.category", "Category")}: ${t(`categories.${ticket.category_name}`, ticket.category_name)}`}>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    {t(
                      `categories.${ticket.category_name}`,
                      ticket.category_name
                    )}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 !font-medium whitespace-nowrap cursor-default" title={`${t("ticketDetails.createdAt")}: ${formatDateTime(ticket.created_at)}`}>
                    <Clock className="w-3 h-3" />
                    {formatDateTime(ticket.created_at)}
                  </span>
                  {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 !font-medium whitespace-nowrap cursor-default" title={`${t("ticketDetails.lastUpdate")}: ${formatDateTime(ticket.updated_at)}`}>
                        <FilePenLine className="w-3 h-3" />
                        {formatDateTime(ticket.updated_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side: Update Button */}
              <button
                onClick={handleUpdateTicket}
                className="action-button">
                <span>{t("ticketDetails.updateTicket")}</span>
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tabs Section */}
          <div className="lg:col-span-2 space-y-6">
            <TicketLeftColumn
              ticket={ticket}
              statusHistory={statusHistory}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleSendComment={handleSendComment}
              actualAttachments={actualAttachments}
              isLoadingAttachments={isLoadingAttachments}
              isUploading={isUploading}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              handleUploadClick={handleUploadClick}
              handleDownloadAttachment={handleDownloadAttachment}
              internalNotes={internalNotes}
              newNote={newNote}
              setNewNote={setNewNote}
              handleAddNote={handleAddNote}
            />
          </div>

          {/* Right Column: Sidebar Cards */}
          <TicketRightColumn
            ticket={ticket}
            localStatus={localStatus}
            localPriority={localPriority}
            handleStatusChange={handleStatusChange}
            handlePriorityChange={handlePriorityChange}
          />
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Copy,
  TicketCheck,
  Clock,
  User,
  AlertTriangle,
  UserStar,
  Repeat,
} from "lucide-react";
import { mockApi } from "../../../../../data/mockData";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { getPriorityColor, getStatusColor } from "../../../../../utils/helpers";
import AlertNotification from "../../../../../components/ui/AlertNotification";
import TicketNotFound from "../../../../../components/ticketDetails/TicketNotFound";
import TicketLeftColumn from "../../../../../components/ticketDetails/TicketLeftColumnTabs/LeftColumnTabs";
import TicketRightColumn from "../../../../../components/ticketDetails/TicketRightColumnCards";

const VALID_FILE_TYPES = ["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Tickets({ adminid, ticketid }) {
  const navigate = useNavigate();
  // UI States
  const [alerts, setAlerts] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  // File Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [actualAttachments, setActualAttachments] = useState([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const fileInputRef = useRef(null);
  // Ticket Data States
  const [localComments, setLocalComments] = useState([]);
  const [localNotes, setLocalNotes] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [localPriority, setLocalPriority] = useState("");
  // DATA FETCHING
  const ticket = mockApi.getTicket(ticketid);
  const statusHistory = mockApi.getStatusHistory(ticketid);
  const apiComments = mockApi.getComments(ticketid);
  const apiInternalNotes = mockApi.getInternalNotes(ticketid);
  // Combine API and Local Data
  const comments = [...apiComments, ...localComments];
  const internalNotes = [...apiInternalNotes, ...localNotes];
  // Fetch attachments on component mount
  useEffect(() => {
    fetchAttachments();
  }, [ticketid]);
  // Sync local status/priority with ticket data
  useEffect(() => {
    setLocalStatus(ticket?.status || "");
    setLocalPriority(ticket?.priority || "");
  }, [ticketid, ticket?.status, ticket?.priority]);

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
      showAlert("error", "Failed to load attachments");
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
    navigate(`/admin/${adminid}/tickets`);
  };

  // TICKET ACTION HANDLERS
  const handleCopyTicketId = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ticket_id);
      setIsCopied(true);
      showAlert("success", "Ticket ID copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showAlert("error", "Failed to copy ticket ID");
    }
  };

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
    closeDropdown();
    showAlert(
      "success",
      `Status updated locally to: ${newStatus.replace("_", " ")}`
    );
  };

  const handlePriorityChange = (newPriority) => {
    setLocalPriority(newPriority);
    closeDropdown();
    showAlert("success", `Priority updated locally to: ${newPriority}`);
  };

  // COMMENT HANDLERS
  const handleSendComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        comment_id: `local-${Date.now()}`,
        ticket_id: ticketid,
        author_name: "HR Admin",
        author_type: "HR",
        text: newComment,
        created_at: new Date().toISOString(),
      };
      setLocalComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
      showAlert("success", "Response sent successfully");
    }
  };

  // NOTE HANDLERS
  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        note_id: `local-${Date.now()}`,
        ticket_id: ticketid,
        author_name: "HR Admin",
        text: newNote,
        created_at: new Date().toISOString(),
      };
      setLocalNotes((prev) => [...prev, newNoteObj]);
      setNewNote("");
      showAlert("success", "Internal note added successfully");
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
          `Invalid file type: ${
            file.name
          }. Allowed types: ${VALID_FILE_TYPES.join(", ")}`
        );
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showAlert(
          "error",
          `File too large: ${file.name}. Maximum size is ${(
            MAX_FILE_SIZE /
            (1024 * 1024)
          ).toFixed(0)}MB`
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

        showAlert("success", `Successfully uploaded: ${file.name}`);
      } catch (error) {
        console.error("Upload error:", error);
        showAlert("error", error.message || `Failed to upload: ${file.name}`);
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

      showAlert("success", `Downloaded: ${attachment.filename}`);
    } catch (error) {
      console.error("Download error:", error);
      showAlert("error", "Failed to download file");
    }
  };

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
            Back to Tickets
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
                    <h1 className="text-2xl font-bold text-gray-900">
                      Ticket ID #{ticket.ticket_id}
                    </h1>
                    <button
                      onClick={handleCopyTicketId}
                      className="group p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                      title="Copy Ticket ID"
                    >
                      {isCopied ? (
                        <TicketCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>

                  {/* SLA Breached Badge */}
                  {isOverdue && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">
                        SLA Breached
                      </span>
                    </div>
                  )}
                </div>

                {/* Ticket Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {ticket.title}
                </h2>

                {/* Ticket Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Employee: {ticket.employee.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(ticket.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {ticket.category_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserStar className="w-3.5 h-3.5" />
                    Assigned to: {ticket.assigned_user_name}
                  </span>
                </div>
              </div>

              {/* Right Side: Update Button */}
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start cursor-pointer"
              >
                <span>Update Ticket</span>
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

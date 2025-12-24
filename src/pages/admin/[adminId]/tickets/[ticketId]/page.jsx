import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Plus,
  User,
  Building2,
  Mail,
  MapPin,
  Calendar,
  Repeat,
  Ticket,
  CheckCircle2,
  Circle,
  ChevronDown,
  UserStar,
} from "lucide-react";

import { mockApi } from "../../../../../data/mockData";

export default function Tickets({ adminid, ticketid }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState("");

  const ticket = mockApi.getTicket(ticketid);
  const statusHistory = mockApi.getStatusHistory(ticketid);
  const comments = mockApi.getComments(ticketid);
  const internalNotes = mockApi.getInternalNotes(ticketid);
  const attachments = mockApi.getAttachments(ticketid);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isOverdue =
    ticket.sla_response_breached || ticket.sla_resolution_breached;

  const handleStatusChange = (newStatus) => {
    alert(`Status would be changed to: ${newStatus}`);
  };

  const handlePriorityChange = (newPriority) => {
    alert(`Priority would be changed to: ${newPriority}`);
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      alert("Comment would be sent: " + newComment);
      setNewComment("");
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      alert("Internal note would be added: " + newNote);
      setNewNote("");
    }
  };

  const handleBack = () => {
    navigate(`/admin/${adminid}/tickets`);
  };

  const tabs = [
    { id: "details", label: "Details" },
    { id: "communication", label: "Communication", count: comments.length },
    { id: "attachments", label: "Attachments", count: attachments.length },
    { id: "notes", label: "Internal Notes", count: internalNotes.length },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "bg-blue-100 text-blue-800 border-blue-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      CRITICAL: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-purple-100 text-purple-800 border-purple-200",
      UNDER_PROCESS: "bg-blue-100 text-blue-800 border-blue-200",
      PENDING_EMPLOYEE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PENDING_THIRD_PARTY: "bg-orange-100 text-orange-800 border-orange-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.NEW;
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-4">
            Ticket not found
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-all duration-200"
          >
            <div className="p-1 rounded-lg group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Tickets
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <Ticket className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Ticket ID #{ticket.ticket_id}
                    </h1>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>

                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>

                  {isOverdue && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">
                        SLA Breached
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {ticket.title}
                </h2>
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

              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl lg:self-start"
              >
                <span>Update Ticket</span>
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-lg font-semibold border-b-3 transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-b-yellow-400 text-gray-800 bg-yellow-50"
                          : "border-b-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                            activeTab === tab.id
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Details Tab */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-md font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 rounded-xl blur"></div>
                        <p className="relative text-gray-800 bg-white p-5 rounded-xl border border-gray-200 shadow-sm leading-relaxed">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100">
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <p className="text-gray-900 font-medium">
                          {ticket.category_name}
                        </p>
                        {ticket.subcategory_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            {ticket.subcategory_name}
                          </p>
                        )}
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100">
                        <label className="block text-md font-semibold text-gray-700 mb-2">
                          Channel
                        </label>
                        <p className="text-gray-900 font-medium">
                          {ticket.channel}
                        </p>
                      </div>
                    </div>

                    {statusHistory.length > 0 && (
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-4">
                          Status History
                        </label>
                        <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-orange-400 before:to-yellow-300">
                          {statusHistory.map((history, index) => (
                            <div
                              key={history.id}
                              className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md shadow-yellow-400/50 transition-all duration-200 "
                            >
                              <div className="absolute -left-6 top-5 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-md"></div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {history.old_status && (
                                      <span className="text-yellow-500">
                                        {history.old_status} →{" "}
                                      </span>
                                    )}
                                    <span className="text-gray-500">
                                      {history.new_status}
                                    </span>
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {formatDateTime(history.changed_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                by {history.changed_by_name}
                              </p>
                              {history.comment && (
                                <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  {history.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Communication Tab */}
                {activeTab === "communication" && (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.comment_id}
                        className={`group p-5 rounded-xl border-2 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                          comment.author_type === "HR"
                            ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300"
                            : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                                comment.author_type === "HR"
                                  ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                  : "bg-gradient-to-br from-gray-600 to-gray-700"
                              }`}
                            >
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {comment.author_name}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  comment.author_type === "HR"
                                    ? "text-yellow-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {comment.author_type}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Send className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No communication yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start the conversation below
                        </p>
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Add Response to Employee
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your response here..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 resize-none"
                      />
                      <button
                        onClick={handleSendComment}
                        className="mt-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Response
                      </button>
                    </div>
                  </div>
                )}

                {/* Attachments Tab */}
                {activeTab === "attachments" && (
                  <div className="space-y-4">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.attachment_id}
                        className="group flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-yellow border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <Download className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-900">
                              {attachment.file_name}
                            </p>
                            <p className="text-md text-gray-600 mt-1">
                              • Uploaded by {attachment.uploaded_by_name}
                              {" • "}
                              {formatFileSize(attachment.file_size)}
                            </p>
                            <p className="text-s text-gray-500">
                              {" • "}
                              {formatDateTime(attachment.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-200">
                          Download
                        </button>
                      </div>
                    ))}

                    {attachments.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Download className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No attachments
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Upload files to share with the team
                        </p>
                      </div>
                    )}

                    <button className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold group">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      Upload Attachment
                    </button>
                  </div>
                )}

                {/* Internal Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    {internalNotes.map((note) => (
                      <div
                        key={note.note_id}
                        className="group p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {note.author_name}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                            {formatDateTime(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    ))}

                    {internalNotes.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="w-8 h-8 text-yellow-600" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          No internal notes
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add private notes for HR team only
                        </p>
                      </div>
                    )}

                    {/* Add Note */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Add Internal Note
                      </label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note visible only to HR team..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                      <button
                        onClick={handleAddNote}
                        className="mt-3 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-700 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                Ticket Information
              </h3>

              <div className="space-y-5">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Status
                  </label>
                  <div className="dropdown dropdown-bottom w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
                    >
                      <span>{ticket.status.replace("_", " ")}</span>
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
                    >
                      <li onClick={() => handleStatusChange("NEW")}>
                        <a className="font-medium hover:bg-purple-400">New</a>
                      </li>
                      <li onClick={() => handleStatusChange("UNDER_PROCESS")}>
                        <a className="font-medium hover:bg-blue-400">
                          Under Process
                        </a>
                      </li>
                      <li
                        onClick={() => handleStatusChange("PENDING_EMPLOYEE")}
                      >
                        <a className="font-medium hover:bg-orange-400">
                          Pending with Employee
                        </a>
                      </li>
                      <li
                        onClick={() =>
                          handleStatusChange("PENDING_THIRD_PARTY")
                        }
                      >
                        <a className="font-medium  hover:bg-orange-300">
                          Pending with Third Party
                        </a>
                      </li>
                      <li onClick={() => handleStatusChange("COMPLETED")}>
                        <a className="font-medium  hover:bg-green-400">
                          Completed
                        </a>
                      </li>
                      <li onClick={() => handleStatusChange("CLOSED")}>
                        <a className="font-medium  hover:bg-gray-400">Closed</a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Priority
                  </label>
                  <div className="dropdown dropdown-bottom w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
                    >
                      <span>{ticket.priority}</span>
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
                    >
                      <li onClick={() => handlePriorityChange("LOW")}>
                        <a className="font-medium  hover:bg-green-400">Low</a>
                      </li>
                      <li onClick={() => handlePriorityChange("MEDIUM")}>
                        <a className="font-medium  hover:bg-blue-400">Medium</a>
                      </li>
                      <li onClick={() => handlePriorityChange("HIGH")}>
                        <a className="font-medium  hover:bg-orange-400">High</a>
                      </li>
                      <li onClick={() => handlePriorityChange("CRITICAL")}>
                        <a className="font-medium  hover:bg-red-500">
                          Critical
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {ticket.assigned_user_name || "Unassigned"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {ticket.assigned_group_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  SLA Tracking
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-blue-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Response Due
                  </label>
                  <p
                    className={`text-sm font-semibold ${
                      ticket.sla_response_breached
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatDateTime(ticket.sla_response_due_at)}
                  </p>
                  {ticket.sla_response_breached && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Breached
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-100 to-white rounded-xl border border-purple-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Resolution Due
                  </label>
                  <p
                    className={`text-sm font-semibold ${
                      ticket.sla_resolution_breached
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatDateTime(ticket.sla_resolution_due_at)}
                  </p>
                  {ticket.sla_resolution_breached && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Breached
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Employee Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {ticket.employee.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {ticket.employee.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Department
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {ticket.employee.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Position
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {ticket.employee.position}
                    </p>
                  </div>
                </div>

                {ticket.employee.location && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {ticket.employee.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

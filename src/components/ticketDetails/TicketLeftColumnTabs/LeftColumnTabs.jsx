import { useState } from "react";
import { useTranslation } from "react-i18next";
import DetailsTab from "./DetailsTab";
import CommunicationTab from "./CommunicationTab";
import AttachmentsTab from "./AttachmentsTab";
import InternalNotesTab from "./InternalNotesTab";

export default function LeftColumnTabs({
  ticket,
  statusHistory,
  comments,
  newComment,
  setNewComment,
  handleSendComment,
  actualAttachments,
  isLoadingAttachments,
  isUploading,
  fileInputRef,
  handleFileUpload,
  handleUploadClick,
  handleDownloadAttachment,
  internalNotes,
  newNote,
  setNewNote,
  handleAddNote,
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { id: "details", label: t("ticketDetails.tabs.details") },
    {
      id: "communication",
      label: t("ticketDetails.tabs.communication"),
      count: comments.length,
    },
    {
      id: "attachments",
      label: t("ticketDetails.tabs.attachments"),
      count: actualAttachments.length,
    },
    {
      id: "notes",
      label: t("ticketDetails.tabs.internalNotes"),
      count: internalNotes.length,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-lg font-semibold border-b-3 transition-all duration-200 whitespace-nowrap cursor-pointer ${
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

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "details" && (
          <DetailsTab ticket={ticket} statusHistory={statusHistory} />
        )}

        {activeTab === "communication" && (
          <CommunicationTab
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleSendComment={handleSendComment}
          />
        )}

        {activeTab === "attachments" && (
          <AttachmentsTab
            actualAttachments={actualAttachments}
            isLoadingAttachments={isLoadingAttachments}
            isUploading={isUploading}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleUploadClick={handleUploadClick}
            handleDownloadAttachment={handleDownloadAttachment}
          />
        )}

        {activeTab === "notes" && (
          <InternalNotesTab
            internalNotes={internalNotes}
            newNote={newNote}
            setNewNote={setNewNote}
            handleAddNote={handleAddNote}
          />
        )}
      </div>
    </div>
  );
}

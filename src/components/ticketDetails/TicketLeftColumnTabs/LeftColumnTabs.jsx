import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, MessagesSquare, Paperclip, Building2 } from "lucide-react";
import DetailsTab from "@components/ticketDetails/TicketLeftColumnTabs/DetailsTab";
import CommunicationTab from "@components/ticketDetails/TicketLeftColumnTabs/CommunicationTab";
import AttachmentsTab from "@components/ticketDetails/TicketLeftColumnTabs/AttachmentsTab";
import InternalNotesTab from "@components/ticketDetails/TicketLeftColumnTabs/InternalNotesTab";

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
  const tabsRef = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      const parent = el.parentElement;
      setIndicator({
        left: el.offsetLeft - parent.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab]);

  const tabs = [
    { id: "details", label: t("ticketDetails.tabs.details"), icon: ClipboardList },
    {
      id: "communication",
      label: t("ticketDetails.tabs.communication"),
      count: comments.length,
      icon: MessagesSquare,
    },
    {
      id: "attachments",
      label: t("ticketDetails.tabs.attachments"),
      count: actualAttachments.length,
      icon: Paperclip,
    },
    {
      id: "notes",
      label: t("ticketDetails.tabs.internalNotes"),
      count: internalNotes.length,
      icon: Building2,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Mobile Tab Navigation - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 md:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-gray-800 shadow-[inset_0_-4px_12px_rgba(234,179,8,0.3)] border border-yellow-300 ring-1 ring-yellow-200"
                : "bg-transparent text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm border border-transparent"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-yellow-500" : ""}`} />
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors duration-300 ${
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

      {/* Desktop Tab Navigation - Row with Sliding Indicator */}
      <div className="hidden md:block bg-gradient-to-r from-gray-50 to-white relative">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[tab.id] = el)}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-3 text-base font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? "text-gray-800 shadow-[inset_0_-6px_16px_rgba(234,179,8,0.25)]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-yellow-500" : ""}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full transition-colors duration-300 ${
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
        {/* Sliding indicator */}
        <div
          className="absolute bottom-0 h-[2px] bg-yellow-400 rounded-full transition-all duration-500 ease-in-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
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

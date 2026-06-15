import { useTranslation } from "react-i18next";
import { Download, Plus, User, UserCog, FileText, Calendar, Image, File } from "lucide-react";
import EmptyState from "@components/ui/EmptyState";
import { formatDateTime } from "@utils/formatDateTime";

const getFileIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(t))
    return { Icon: Image, color: 'text-green-600', bg: 'from-green-100 to-green-200' };
  if (['pdf', 'application/pdf'].includes(t))
    return { Icon: FileText, color: 'text-red-600', bg: 'from-red-100 to-red-200' };
  if (['doc', 'docx', 'txt', 'application/msword'].includes(t))
    return { Icon: FileText, color: 'text-blue-600', bg: 'from-blue-100 to-blue-200' };
  return { Icon: File, color: 'text-yellow-600', bg: 'from-yellow-100 to-yellow-200' };
};

export default function AttachmentsTab({
  actualAttachments,
  isLoadingAttachments,
  isUploading,
  fileInputRef,
  handleFileUpload,
  handleUploadClick,
  handleDownloadAttachment,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {isLoadingAttachments ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {actualAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 bg-gradient-to-r from-yellow-50 to-yellow border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover-effect"
            >
              <div className="flex items-start md:items-center gap-4">
                {(() => {
                  const { Icon, color, bg } = getFileIcon(attachment.type);
                  return (
                    <div className={`w-12 h-12 bg-gradient-to-br ${bg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                  );
                })()}
                <div>
                  {attachment.uploadedBy && (
                    <div className="flex items-center gap-2 mb-1">
                      {attachment.uploadedByType === "hr_staff" ? (
                        <UserCog className="w-3.5 h-3.5 text-yellow-600" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <p className={`!text-sm !font-bold ${
                        attachment.uploadedByType === "hr_staff"
                          ? "!text-yellow-700"
                          : "!text-blue-700"
                      }`}>
                        {attachment.uploadedBy}
                        <span className={`!text-xs !font-semibold ${
                          attachment.uploadedByType === "hr_staff"
                            ? "!text-yellow-500"
                            : "!text-blue-500"
                        }`}>
                          {` • ${attachment.uploadedByType === "hr_staff" ? "HR" : "Employee"}`}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className="!text-md !font-semibold !text-gray-900 ps-2 mb-1">
                    {attachment.filename}
                  </p>
                  <p className="!text-xs !font-semibold !text-gray-500 ps-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {attachment.sizeFormatted}
                    {" • "}
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(attachment.uploadedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadAttachment(attachment)}
                className="w-full md:w-auto px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-200 flex items-center justify-center md:justify-start gap-2"
              >
                <Download className="w-4 h-4" />
                {t("ticketDetails.attachments.download")}
              </button>
            </div>
          ))}

          {actualAttachments.length === 0 && !isUploading && (
            <EmptyState
              icon={Download}
              title={t("ticketDetails.attachments.noAttachments")}
              description={t("ticketDetails.attachments.uploadFiles")}
              className="py-12"
            />
          )}
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp"
      />

      {/* Upload Button */}
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className="w-full cursor-pointer px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
            {t("ticketDetails.attachments.uploading")}
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
            {t("ticketDetails.attachments.uploadAttachment")}
          </>
        )}
      </button>
    </div>
  );
}

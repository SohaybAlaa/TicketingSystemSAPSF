import { useTranslation } from "react-i18next";
import { Download, Plus } from "lucide-react";
import { formatDateTime } from "../../../utils/formatDateTime";

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
              className="group flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-yellow border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                  <Download className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-md font-semibold text-gray-900">
                    {attachment.filename}
                  </p>
                  <p className="text-md text-gray-600 mt-1">
                    {attachment.sizeFormatted}
                    {" • "}
                    {formatDateTime(attachment.uploadedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadAttachment(attachment)}
                className="px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-200"
              >
                {t("ticketDetails.attachments.download")}
              </button>
            </div>
          ))}

          {actualAttachments.length === 0 && !isUploading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-900 font-medium">
                {t("ticketDetails.attachments.noAttachments")}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {t("ticketDetails.attachments.uploadFiles")}
              </p>
            </div>
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

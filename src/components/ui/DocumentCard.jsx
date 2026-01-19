import React from "react";
import { Download, Trash2 } from "lucide-react";

/**
 * DocumentCard - A reusable card component for displaying document information
 * 
 * @param {Object} props
 * @param {Object} props.document - The document object to display
 * @param {Function} props.onDownload - Function to call when download button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {React.ComponentType} props.FileIcon - Component to render the file icon
 * @param {string} props.borderClass - CSS class for the card border
 * @returns {JSX.Element}
 */
const DocumentCard = ({
  document,
  onDownload,
  onDelete,
  isRTL,
  FileIcon,
  borderClass,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 p-6 hover-effect ${borderClass}`}
    >
      <div
        className={`flex items-start justify-between mb-4 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {isRTL ? (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => onDownload(document)}
                className="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full transition-colors"
                type="button"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={() => onDelete(document)}
                className="p-1.5 text-red-600 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                type="button"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            <FileIcon type={document.type} />
          </>
        ) : (
          <>
            <FileIcon type={document.type} />
            <div className="flex gap-2">
              <button
                onClick={() => onDownload(document)}
                className="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full transition-colors"
                type="button"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={() => onDelete(document)}
                className="p-1.5 text-red-600 cursor-pointer hover:bg-red-50 rounded-full transition-colors"
                type="button"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
      <h3
        className={`!font-semibold !text-gray-900 !mb-2 !truncate ${isRTL ? "!font-bold" : ""}`}
        title={document.filename}
      >
        {document.filename}
      </h3>
      <div className="space-y-1 text-sm text-gray-600">
        <div
          className={`flex justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-medium" style={{ direction: "ltr" }}>{document.size}</span>
          <span className="font-medium">{document.uploadedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

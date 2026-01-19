import React from "react";
import DocumentCard from "@ui/DocumentCard";

/**
 * DocumentsGrid - A component for displaying documents in a grid layout
 * 
 * @param {Object} props
 * @param {Array} props.documents - Array of document objects to display
 * @param {Function} props.onDownload - Function to call when download button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {React.ComponentType} props.FileIcon - Component to render the file icon
 * @param {Function} props.getCardBorderClass - Function to determine card border class based on document type
 * @param {string} [props.className="mt-6"] - Additional CSS classes for the grid container
 * @returns {JSX.Element}
 */
const DocumentsGrid = ({ 
  documents, 
  onDownload, 
  onDelete, 
  isRTL, 
  FileIcon, 
  getCardBorderClass,
  className = "mt-6"
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDownload={onDownload}
          onDelete={onDelete}
          isRTL={isRTL}
          FileIcon={FileIcon}
          borderClass={getCardBorderClass(doc.type)}
        />
      ))}
    </div>
  );
};

export default DocumentsGrid;

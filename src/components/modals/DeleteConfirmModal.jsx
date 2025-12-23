import React from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

/**
 * Unified Delete Confirmation Modal
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {function} onConfirm - Callback when delete is confirmed
 * @param {string} type - Type of item: "ticket" or "document"
 * @param {string} itemName - Name/ID of the item (e.g., "TKT-01" or "file.pdf")
 * @param {string} ticketId - (Legacy prop) Ticket ID - maps to itemName
 * @param {number} count - Number of items being deleted (for bulk operations)
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  type = "document",
  itemName,
  ticketId,
  count = 1,
}) => {
  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
    onClose();
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  // Auto-detect type if ticketId is provided (legacy support)
  // If ticketId prop exists (even if empty string), we're on tickets page
  const actualType = ticketId !== undefined ? "ticket" : type;
  const actualItemName = ticketId || itemName;

  // Configure content based on type
  const isTicket = actualType === "ticket";
  const isMultiple = count > 1;

  const title = isTicket
    ? isMultiple
      ? `Delete ${count} Tickets`
      : "Delete Ticket"
    : isMultiple
    ? `Delete ${count} Documents`
    : "Delete Document";

  const subtitle = "This action cannot be undone";

  const message = isTicket ? (
    isMultiple ? (
      `Are you sure you want to delete these ${count} tickets?`
    ) : (
      <>
        Are you sure you want to delete ticket{" "}
        <span className="font-semibold">{actualItemName}</span>?
      </>
    )
  ) : isMultiple ? (
    `Are you sure you want to delete these ${count} documents?`
  ) : (
    <>
      Are you sure you want to delete{" "}
      <span className="font-semibold">"{actualItemName}"</span>?
    </>
  );

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 50000 }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in"
        style={{ zIndex: 50001 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              type="button"
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium
                transition-all duration-300 ease-out
                hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md
                active:translate-y-0 active:shadow-sm
                focus:outline-none focus:ring-2 focus:ring-gray-400/60 focus:ring-offset-2"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              type="button"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium
                transition-all duration-300 ease-out
                hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/20
                active:translate-y-0 active:shadow-md
                focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;

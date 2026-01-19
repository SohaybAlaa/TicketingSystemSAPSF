import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

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

  // Get translated title
  const title = isTicket
    ? isMultiple
      ? t("modals.deleteConfirm.deleteTickets", { count })
      : t("modals.deleteConfirm.deleteTicket")
    : isMultiple
    ? t("modals.deleteConfirm.deleteDocuments", { count })
    : t("modals.deleteConfirm.deleteDocument");

  const subtitle = t("modals.deleteConfirm.cannotUndo");

  // Get translated message
  const getMessageKey = () => {
    if (isTicket) {
      return isMultiple
        ? "modals.deleteConfirm.confirmTickets"
        : "modals.deleteConfirm.confirmTicket";
    } else {
      return isMultiple
        ? "modals.deleteConfirm.confirmDocuments"
        : "modals.deleteConfirm.confirmDocument";
    }
  };

  const message = t(getMessageKey(), {
    count,
    itemName: actualItemName,
  });

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
        <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
          <div
            className={`flex items-center gap-3 mb-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <h3>{title}</h3>
              <p className="!text-sm !text-gray-600">{subtitle}</p>
            </div>
          </div>
          <p
            className={`!text-gray-700 !mb-6 ${
              isRTL ? "!text-right" : "!text-left"
            }`}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={handleClose}
              type="button"
              className="cancel-button"
            >
              {t("modals.deleteConfirm.cancel")}
            </button>

            <button
              onClick={handleConfirm}
              type="button"
              className="delete-button"
            >
              {t("modals.deleteConfirm.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;

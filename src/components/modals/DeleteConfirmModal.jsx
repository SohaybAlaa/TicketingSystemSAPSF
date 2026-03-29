import React from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import Modal from "./Modal";

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

  const actualType = ticketId !== undefined ? "ticket" : type;
  const actualItemName = ticketId || itemName;
  const isTicket = actualType === "ticket";
  const isGroup = actualType === "group";
  const isMember = actualType === "member";
  const isMultiple = count > 1;

  const title = isTicket
    ? isMultiple
      ? t("modals.deleteConfirm.deleteTickets", { count })
      : t("modals.deleteConfirm.deleteTicket")
    : isGroup
    ? isMultiple
      ? t("modals.deleteConfirm.deleteGroups", { count })
      : t("modals.deleteConfirm.deleteGroup")
    : isMember
    ? isMultiple
      ? t("modals.deleteConfirm.deleteMembers", { count })
      : t("modals.deleteConfirm.deleteMember")
    : isMultiple
    ? t("modals.deleteConfirm.deleteDocuments", { count })
    : t("modals.deleteConfirm.deleteDocument");

  const getMessageKey = () => {
    if (isTicket)
      return isMultiple
        ? "modals.deleteConfirm.confirmTickets"
        : "modals.deleteConfirm.confirmTicket";
    if (isGroup)
      return isMultiple
        ? "modals.deleteConfirm.confirmGroups"
        : "modals.deleteConfirm.confirmGroup";
    if (isMember)
      return isMultiple
        ? "modals.deleteConfirm.confirmMembers"
        : "modals.deleteConfirm.confirmMember";
    return isMultiple
      ? "modals.deleteConfirm.confirmDocuments"
      : "modals.deleteConfirm.confirmDocument";
  };

  const message = t(getMessageKey(), { count, itemName: actualItemName });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      icon={
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "linear-gradient(to bottom right, #fca5a5, #ef4444)",
            boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Trash2 size={26} color="#7f1d1d" />
        </div>
      }
      subtitle={t("modals.deleteConfirm.cannotUndo")}
    >
      <div dir={isRTL ? "rtl" : "ltr"}>
        <div className={`flex items-center gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
            <p
              className={`!text-gray-700  !text-xl ${isRTL ? "!text-right" : "!text-left"}`}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </div>
        </div>
        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button onClick={handleClose} type="button" className="cancel-button">
            {t("modals.deleteConfirm.cancel")}
          </button>
          <button onClick={handleConfirm} type="button" className="delete-button">
            {t("modals.deleteConfirm.delete")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;

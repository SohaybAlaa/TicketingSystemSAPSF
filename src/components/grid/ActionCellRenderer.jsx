import React, { useState, useRef } from "react";
import { EllipsisVertical } from "lucide-react";
import ActionMenu from "../ui/ActionMenu";
import AssignToOtherModal from "../modals/AssignToOtherModal";
import ChangeStatusModal from "../modals/ChangeStatusModal";
import ChangePriorityModal from "../modals/ChangePriorityModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";

/**
 * Action Cell Renderer - Renders action button and handles all modals for a single row
 * @param {object} data - Row data from AG Grid
 * @param {function} onStatusChange - Callback for status changes
 * @param {function} onPriorityChange - Callback for priority changes
 * @param {function} onDelete - Callback for delete action
 * @param {function} onAssignToMe - Callback for assign to me action
 * @param {function} onAssignToOther - Callback for assign to other action
 */
export default function ActionCellRenderer({
  data,
  onStatusChange,
  onPriorityChange,
  onDelete,
  onAssignToMe,
  onAssignToOther,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignToOtherModalOpen, setIsAssignToOtherModalOpen] =
    useState(false);
  const buttonRef = useRef(null);

  const handleButtonClick = (e) => {
    e.stopPropagation();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left - 150,
      });
    }

    setIsMenuOpen(!isMenuOpen);
  };

  const handleAction = (action, ticketId) => {
    switch (action) {
      case "assignToMe":
        onAssignToMe(ticketId);
        break;
      case "assignToOther":
        setIsAssignToOtherModalOpen(true);
        break;
      case "changeStatus":
        setIsStatusModalOpen(true);
        break;
      case "changePriority":
        setIsPriorityModalOpen(true);
        break;
      case "delete":
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(data.ticketId);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <EllipsisVertical size={18} color="#6b7280" />
      </button>

      <ActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        position={menuPosition}
        onAction={handleAction}
        ticketId={data.ticketId}
      />

      <AssignToOtherModal
        isOpen={isAssignToOtherModalOpen}
        onClose={() => setIsAssignToOtherModalOpen(false)}
        onSave={onAssignToOther}
        ticketId={data.ticketId}
      />

      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={data.status}
        onSave={onStatusChange}
        ticketId={data.ticketId}
      />

      <ChangePriorityModal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        currentPriority={data.priority}
        onSave={onPriorityChange}
        ticketId={data.ticketId}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        ticketId={data.ticketId}
        count={1}
      />
    </>
  );
}

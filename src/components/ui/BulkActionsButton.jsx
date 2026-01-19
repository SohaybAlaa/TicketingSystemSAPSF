import React from "react";
import { EllipsisVertical } from "lucide-react";
import ActionMenu from "@ui/ActionMenu";
import ChangeStatusModal from "@components/modals/ChangeStatusModal";
import ChangePriorityModal from "@components/modals/ChangePriorityModal";
import DeleteConfirmModal from "@components/modals/DeleteConfirmModal";
import AssignToOtherModal from "@components/modals/AssignToOtherModal";

/**
 * BulkActionsButton - A component for handling bulk actions on selected tickets
 * 
 * @param {Object} props
 * @param {Array} props.selectedRows - Array of selected ticket rows
 * @param {React.RefObject} props.bulkButtonRef - Ref for the bulk actions button
 * @param {Function} props.handleBulkButtonClick - Click handler for the bulk button
 * @param {boolean} props.isBulkMenuOpen - Whether the bulk menu is open
 * @param {Function} props.setIsBulkMenuOpen - Function to toggle bulk menu
 * @param {Object} props.bulkMenuPosition - Position of the bulk menu {top, left}
 * @param {Function} props.handleBulkAction - Handler for bulk actions
 * @param {boolean} props.isBulkStatusModalOpen - Whether the status modal is open
 * @param {Function} props.setIsBulkStatusModalOpen - Function to toggle status modal
 * @param {boolean} props.isBulkPriorityModalOpen - Whether the priority modal is open
 * @param {Function} props.setIsBulkPriorityModalOpen - Function to toggle priority modal
 * @param {boolean} props.isBulkDeleteModalOpen - Whether the delete modal is open
 * @param {Function} props.setIsBulkDeleteModalOpen - Function to toggle delete modal
 * @param {boolean} props.isBulkAssignToOtherModalOpen - Whether the assign modal is open
 * @param {Function} props.setIsBulkAssignToOtherModalOpen - Function to toggle assign modal
 * @param {Function} props.handleBulkStatusChange - Handler for bulk status changes
 * @param {Function} props.handleBulkPriorityChange - Handler for bulk priority changes
 * @param {Function} props.handleBulkDelete - Handler for bulk delete
 * @param {Function} props.handleBulkAssignToOther - Handler for bulk assign to other
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const BulkActionsButton = ({
  selectedRows,
  bulkButtonRef,
  handleBulkButtonClick,
  isBulkMenuOpen,
  setIsBulkMenuOpen,
  bulkMenuPosition,
  handleBulkAction,
  isBulkStatusModalOpen,
  setIsBulkStatusModalOpen,
  isBulkPriorityModalOpen,
  setIsBulkPriorityModalOpen,
  isBulkDeleteModalOpen,
  setIsBulkDeleteModalOpen,
  isBulkAssignToOtherModalOpen,
  setIsBulkAssignToOtherModalOpen,
  handleBulkStatusChange,
  handleBulkPriorityChange,
  handleBulkDelete,
  handleBulkAssignToOther,
  isRTL,
  t
}) => {
  return (
    <div 
      className="relative animate-fadeIn"
      style={{
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      <button
        ref={bulkButtonRef}
        onClick={handleBulkButtonClick}
        className="action-button"
      >
        {t("ticketsPage.bulkActions", { count: selectedRows.length })}
        <EllipsisVertical size={16} />
      </button>

      <ActionMenu
        isOpen={isBulkMenuOpen}
        onClose={() => setIsBulkMenuOpen(false)}
        position={bulkMenuPosition}
        ticketId="BULK"
        onAction={(action) => {
          handleBulkAction(action);
          setIsBulkMenuOpen(false);
        }}
      />

      <ChangeStatusModal
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        currentStatus={selectedRows[0]?.status || "New"}
        onSave={handleBulkStatusChange}
        ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
      />

      <ChangePriorityModal
        isOpen={isBulkPriorityModalOpen}
        onClose={() => setIsBulkPriorityModalOpen(false)}
        currentPriority={selectedRows[0]?.priority || "MEDIUM"}
        onSave={handleBulkPriorityChange}
        ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
      />

      <DeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        ticketId=""
        count={selectedRows.length}
      />

      <AssignToOtherModal
        isOpen={isBulkAssignToOtherModalOpen}
        onClose={() => setIsBulkAssignToOtherModalOpen(false)}
        onSave={handleBulkAssignToOther}
        ticketId={`${selectedRows.length} ${t("ticketsPage.tickets")}`}
      />
    </div>
  );
};

export default BulkActionsButton;

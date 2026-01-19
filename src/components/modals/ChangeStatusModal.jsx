import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { STATUSES } from "@utils/helpers";

// Color mapping function based on Tag component
const getTagColor = (value) => {
  const COLOR_MAP = {
    // Status colors
    "PENDING THIRDPARTY": "#fc6900",
    "PENDING EMPLOYEE": "#eab308",
    "UNDER PROCESS": "#3b82f6",
    NEW: "#9333ea",
    COMPLETED: "#22c55e",
    CLOSED: "#6b7280",
  };
  
  // Normalize the value for color mapping
  const normalizedValue = value?.toUpperCase().replace(/_/g, ' ') || "";
  
  // Get the color based on the value
  return COLOR_MAP[normalizedValue] || "#6b7280"; // Default gray
};

/**
 * Change Status Modal
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} currentStatus - Current status of the ticket(s)
 * @param {function} onSave - Callback when status is changed
 * @param {string} ticketId - ID of ticket being modified
 */
export default function ChangeStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onSave,
  ticketId,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  // Update selected status when currentStatus changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSave = () => {
    onSave(selectedStatus, ticketId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.changeStatus.title", { ticketId })}
    >
      <div className="mb-6">
        <label
          className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("modals.changeStatus.selectStatus")}
        </label>
        <div className="flex flex-col gap-2">
          {STATUSES.map((status) => (
            <label
              key={status.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${
                  selectedStatus === status.value 
                    ? getTagColor(status.value) 
                    : "#e5e7eb"
                }`,
                backgroundColor:
                  selectedStatus === status.value 
                    ? `${getTagColor(status.value)}10` // 10% opacity background for selected state
                    : "white",
                cursor: "pointer",
                transition: "all 0.15s",
                flexDirection: "row",
                justifyContent: "space-between", // Better spacing between label and radio
              }}
              onMouseEnter={(e) => {
                if (selectedStatus !== status.value) {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStatus !== status.value) {
                  e.currentTarget.style.backgroundColor = "white";
                }
              }}
            >
              <span
                style={{
                  backgroundColor: `${getTagColor(status.value)}20`, // 20% opacity
                  borderColor: `${getTagColor(status.value)}40`, // 40% opacity
                  color: getTagColor(status.value),
                  borderWidth: "1px",
                  borderStyle: "solid",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  marginRight: isRTL ? "0" : "12px",
                  marginLeft: isRTL ? "12px" : "0",
                  direction: isRTL ? "rtl" : "ltr"
                }}
              >
                {t(`ticketsPage.statuses.${status.value}`)}
              </span>
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={selectedStatus === status.value}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="hidden-radio"
              />
            </label>
          ))}
        </div>
      </div>

      <div
        className={`flex gap-3 justify-end mt-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <button
          onClick={onClose}
          className="modal-cancel-button"
        >
          {t("modals.changeStatus.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="modal-save-button"
        >
          {t("modals.changeStatus.save")}
        </button>
      </div>
    </Modal>
  );
}

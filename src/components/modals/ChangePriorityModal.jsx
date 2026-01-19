import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { PRIORITIES } from "@utils/helpers";

// Color mapping function based on Tag component
const getTagColor = (value) => {
  const COLOR_MAP = {
    // Priority colors
    LOW: "#22c55e",
    MEDIUM: "#3b82f6",
    HIGH: "#fc6900",
    CRITICAL: "#ef4444",
  };
  
  // Normalize the value for color mapping
  const normalizedValue = value?.toUpperCase().replace(/_/g, ' ') || "";
  
  // Get the color based on the value
  return COLOR_MAP[normalizedValue] || "#6b7280"; // Default gray
};

/**
 * Change Priority Modal
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} currentPriority - Current priority of the ticket(s)
 * @param {function} onSave - Callback when priority is changed
 * @param {string} ticketId - ID of ticket being modified
 */
export default function ChangePriorityModal({
  isOpen,
  onClose,
  currentPriority,
  onSave,
  ticketId,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [selectedPriority, setSelectedPriority] = useState(currentPriority);

  // Update selected priority when currentPriority changes
  useEffect(() => {
    setSelectedPriority(currentPriority);
  }, [currentPriority]);

  const handleSave = () => {
    onSave(selectedPriority, ticketId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.changePriority.title", { ticketId })}
    >
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {t("modals.changePriority.selectPriority")}
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PRIORITIES.map((priority) => (
            <label
              key={priority.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${
                  selectedPriority === priority.value 
                    ? getTagColor(priority.value) 
                    : "#e5e7eb"
                }`,
                backgroundColor:
                  selectedPriority === priority.value 
                    ? `${getTagColor(priority.value)}10` // 10% opacity background for selected state
                    : "white",
                cursor: "pointer",
                transition: "all 0.15s",
                flexDirection: "row",
                justifyContent: "space-between", // Better spacing between label and radio
              }}
              onMouseEnter={(e) => {
                if (selectedPriority !== priority.value) {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPriority !== priority.value) {
                  e.currentTarget.style.backgroundColor = "white";
                }
              }}
            >
              <span
                style={{
                  backgroundColor: `${getTagColor(priority.value)}20`, // 20% opacity
                  borderColor: `${getTagColor(priority.value)}40`, // 40% opacity
                  color: getTagColor(priority.value),
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
                {t(`ticketsPage.priorities.${priority.value}`)}
              </span>
              <input
                type="radio"
                name="priority"
                value={priority.value}
                checked={selectedPriority === priority.value}
                onChange={(e) => setSelectedPriority(e.target.value)}
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
          {t("modals.changePriority.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="modal-save-button"
        >
          {t("modals.changePriority.save")}
        </button>
      </div>
    </Modal>
  );
}

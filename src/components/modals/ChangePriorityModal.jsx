import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { PRIORITIES } from "../../utils/helpers";

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
      title={`Change Priority - ${ticketId}`}
    >
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Select Priority
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
                  selectedPriority === priority.value ? "#facc15" : "#e5e7eb"
                }`,
                backgroundColor:
                  selectedPriority === priority.value ? "#fefce8" : "white",
                cursor: "pointer",
                transition: "all 0.15s",
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
              <input
                type="radio"
                name="priority"
                value={priority.value}
                checked={selectedPriority === priority.value}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  marginRight: "12px",
                  cursor: "pointer",
                  accentColor: "#facc15",
                }}
              />
              <span
                style={{
                  backgroundColor: priority.color,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {priority.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: "white",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#facc15",
            color: "#111827",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fbbf24";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#facc15";
          }}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

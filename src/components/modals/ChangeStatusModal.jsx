import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { STATUSES } from "../../data/mockData";

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
      title={`Change Status - ${ticketId}`}
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
          Select Status
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {STATUSES.map((status) => (
            <label
              key={status.value}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                borderRadius: "8px",
                border: `2px solid ${
                  selectedStatus === status.value ? "#facc15" : "#e5e7eb"
                }`,
                backgroundColor:
                  selectedStatus === status.value ? "#fefce8" : "white",
                cursor: "pointer",
                transition: "all 0.15s",
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
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={selectedStatus === status.value}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  marginRight: "12px",
                  cursor: "pointer",
                  accentColor: "#facc15",
                }}
              />
              <span
                style={{
                  backgroundColor: status.color,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {status.label}
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

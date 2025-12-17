import { AllCommunityModule } from "ag-grid-community";
import { myTheme } from "./themes";
import { AgGridReact } from "ag-grid-react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  EllipsisVertical,
  User,
  Users,
  SquarePen,
  Trash2,
  UserPlus,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react";

// Global Alert Notification Component
function AlertNotification({ alert, onClose }) {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const getAlertStyles = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "#d1fae5",
          border: "#34d399",
          text: "#065f46",
          icon: CheckCircle,
        };
      case "error":
        return {
          bg: "#fee2e2",
          border: "#f87171",
          text: "#991b1b",
          icon: XCircle,
        };
      case "warning":
        return {
          bg: "#fef3c7",
          border: "#fbbf24",
          text: "#92400e",
          icon: AlertCircle,
        };
      case "info":
        return {
          bg: "#dbeafe",
          border: "#60a5fa",
          text: "#1e40af",
          icon: Info,
        };
      default:
        return {
          bg: "#f3f4f6",
          border: "#9ca3af",
          text: "#374151",
          icon: Info,
        };
    }
  };

  const styles = getAlertStyles(alert.type);
  const Icon = styles.icon;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100000,
        minWidth: "320px",
        maxWidth: "500px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(400px);
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: styles.bg,
          border: `2px solid ${styles.border}`,
          borderRadius: "12px",
          padding: "16px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <Icon size={24} color={styles.text} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          {alert.title && (
            <h4
              style={{
                margin: 0,
                marginBottom: "4px",
                fontSize: "16px",
                fontWeight: "600",
                color: styles.text,
              }}
            >
              {alert.title}
            </h4>
          )}
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: styles.text,
              lineHeight: "1.5",
            }}
          >
            {alert.message}
          </p>
        </div>
        <button
          onClick={onClose}
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
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={18} color={styles.text} />
        </button>
      </div>
    </div>,
    document.body
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  ticketId,
  count = 1,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "90%",
          maxWidth: "450px",
          padding: "24px",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <Trash2 size={24} color="#dc2626" />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Delete {count > 1 ? `${count} Tickets` : "Ticket"}
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          {count > 1 ? (
            <>
              Are you sure you want to delete these {count} tickets? This action
              cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete ticket <strong>{ticketId}</strong>
              ? This action cannot be undone.
            </>
          )}
        </p>

        {/* Buttons */}
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#b91c1c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#dc2626";
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Assign to Other Modal
function AssignToOtherModal({ isOpen, onClose, onSave, ticketId }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const teams = [
    {
      teamId: "teamA",
      teamName: "Team A",
      members: ["John Smith", "Jennifer Lee", "Maria Garcia", "James Wilson"],
    },
    {
      teamId: "teamB",
      teamName: "Team B",
      members: ["Anna Williams", "Robert Brown", "Christopher Davis"],
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedTeam(null);
      setSelectedMember(null);
    }
  }, [isOpen]);

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    setSelectedMember(null); // Reset member selection when team changes
  };

  const handleSave = () => {
    if (selectedMember) {
      onSave(selectedMember, ticketId);
      onClose();
    }
  };

  const currentTeam = teams.find((t) => t.teamId === selectedTeam);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign to Other - ${ticketId}`}
    >
      <div style={{ marginBottom: "24px" }}>
        {/* Step 1: Team Selection */}
        <div style={{ marginBottom: selectedTeam ? "24px" : "0" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Step 1: Select Team
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {teams.map((team) => (
              <button
                key={team.teamId}
                onClick={() => handleTeamSelect(team.teamId)}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "8px",
                  border: `2px solid ${
                    selectedTeam === team.teamId ? "#facc15" : "#e5e7eb"
                  }`,
                  backgroundColor:
                    selectedTeam === team.teamId ? "#fefce8" : "white",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  if (selectedTeam !== team.teamId) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTeam !== team.teamId) {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <Users
                  size={20}
                  style={{ display: "inline-block", marginBottom: "4px" }}
                />
                <div>{team.teamName}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {team.members.length} members
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Member Selection */}
        {selectedTeam && currentTeam && (
          <div
            style={{
              animation: "fadeIn 0.3s ease-in",
            }}
          >
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Step 2: Select Team Member
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {currentTeam.members.map((member) => (
                <label
                  key={member}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `2px solid ${
                      selectedMember === member ? "#facc15" : "#e5e7eb"
                    }`,
                    backgroundColor:
                      selectedMember === member ? "#fefce8" : "white",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMember !== member) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMember !== member) {
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="member"
                    value={member}
                    checked={selectedMember === member}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    style={{
                      marginRight: "12px",
                      cursor: "pointer",
                      accentColor: "#facc15",
                    }}
                  />
                  <User
                    size={18}
                    style={{ marginRight: "8px", color: "#6b7280" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    {member}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
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
          disabled={!selectedMember}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: selectedMember ? "#facc15" : "#e5e7eb",
            color: selectedMember ? "#111827" : "#9ca3af",
            fontSize: "14px",
            fontWeight: "600",
            cursor: selectedMember ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (selectedMember) {
              e.currentTarget.style.backgroundColor = "#fbbf24";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMember) {
              e.currentTarget.style.backgroundColor = "#facc15";
            }
          }}
        >
          Assign
        </button>
      </div>
    </Modal>
  );
}

// Change Status Modal
function ChangeStatusModal({
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

  const statuses = [
    { value: "New", label: "New", color: "#ede9fe" },
    { value: "Under Process", label: "Under Process", color: "#dbeafe" },
    { value: "Pending Employee", label: "Pending Employee", color: "#fffbeb" },
    {
      value: "Pending ThirdParty",
      label: "Pending ThirdParty",
      color: "#fef3c7",
    },
    { value: "Completed", label: "Completed", color: "#d1fae5" },
    { value: "Closed", label: "Closed", color: "#e5e7eb" },
  ];

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
          {statuses.map((status) => (
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

// Change Priority Modal
function ChangePriorityModal({
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

  const priorities = [
    { value: "CRITICAL", label: "Critical", color: "#fecaca" },
    { value: "HIGH", label: "High", color: "#fed7aa" },
    { value: "MEDIUM", label: "Medium", color: "#dbeafe" },
    { value: "LOW", label: "Low", color: "#d1fae5" },
  ];

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
          {priorities.map((priority) => (
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

// Action Menu Component with Portal
function ActionMenu({ isOpen, onClose, position, onAction, ticketId }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: User, label: "Assign to Me", action: "assignToMe" },
    { icon: Users, label: "Assign to Other", action: "assignToOther" },
    { icon: SquarePen, label: "Change Status", action: "changeStatus" },
    { icon: SquarePen, label: "Change Priority", action: "changePriority" },
    { icon: Trash2, label: "Delete", action: "delete", danger: true },
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        minWidth: "180px",
        padding: "4px",
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onAction(item.action, ticketId);
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px 12px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "14px",
            color: item.danger ? "#dc2626" : "#374151",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = item.danger
              ? "#fee2e2"
              : "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

// Action Cell Renderer
function ActionCellRenderer({
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

export default function Tickets() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message, title = "") => {
    setAlert({ type, message, title });
  };

  const [rowData, setRowData] = useState([
    {
      ticketId: "TKT-1001",
      title: "Incorrect salary amount in November payslip",
      category: "Payroll & Benefits",
      employee: "John Smith",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 9, 2025",
      slaDue: "Dec 12, 11:02 AM",
    },
    {
      ticketId: "TKT-1002",
      title: "Unable to access HR portal",
      category: "IT Access",
      employee: "Anna Williams",
      department: "Marketing",
      priority: "CRITICAL",
      status: "New",
      assignedTo: "Sarah Johnson",
      created: "Dec 11, 2025",
      slaDue: "Dec 11, 07:02 PM",
    },
    {
      ticketId: "TKT-1003",
      title: "Request for 3 days sick leave",
      category: "Leave & Attendance",
      employee: "Robert Brown",
      department: "Sales",
      priority: "MEDIUM",
      status: "Pending Employee",
      assignedTo: "Michael Chen",
      created: "Dec 10, 2025",
      slaDue: "Dec 13, 05:02 PM",
    },
    {
      ticketId: "TKT-1004",
      title: "Questions about health insurance coverage",
      category: "Payroll & Benefits",
      employee: "Maria Garcia",
      department: "Finance",
      priority: "LOW",
      status: "Completed",
      assignedTo: "Sarah Johnson",
      created: "Dec 6, 2025",
      slaDue: "Dec 11, 05:02 PM",
    },
    {
      ticketId: "TKT-1005",
      title: "Performance review document not accessible",
      category: "Performance",
      employee: "James Wilson",
      department: "Operations",
      priority: "MEDIUM",
      status: "Pending ThirdParty",
      assignedTo: "Michael Chen",
      created: "Dec 8, 2025",
      slaDue: "Dec 12, 05:02 AM",
    },
    {
      ticketId: "TKT-1006",
      title: "Vacation leave approval pending for 2 weeks",
      category: "Leave & Attendance",
      employee: "Jennifer Lee",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Nov 27, 2025",
      slaDue: "Nov 28, 05:02 PM",
    },
    {
      ticketId: "TKT-1007",
      title: "Remote work policy clarification",
      category: "Policy Questions",
      employee: "Christopher Davis",
      department: "HR",
      priority: "LOW",
      status: "Closed",
      assignedTo: "Emily Rodriguez",
      created: "Dec 1, 2025",
      slaDue: "Dec 6, 05:02 PM",
    },
    {
      ticketId: "TKT-1008",
      title: "Password reset for benefits portal",
      category: "IT Access",
      employee: "John Smith",
      department: "Engineering",
      priority: "CRITICAL",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 11, 2025",
      slaDue: "Dec 11, 08:02 PM",
    },
    {
      ticketId: "TKT-1009",
      title: "Incorrect salary amount in November payslip",
      category: "Payroll & Benefits",
      employee: "John Smith",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 9, 2025",
      slaDue: "Dec 12, 11:02 AM",
    },
    {
      ticketId: "TKT-1010",
      title: "Unable to access HR portal",
      category: "IT Access",
      employee: "Anna Williams",
      department: "Marketing",
      priority: "CRITICAL",
      status: "New",
      assignedTo: "Sarah Johnson",
      created: "Dec 11, 2025",
      slaDue: "Dec 11, 07:02 PM",
    },
    {
      ticketId: "TKT-1011",
      title: "Request for 3 days sick leave",
      category: "Leave & Attendance",
      employee: "Robert Brown",
      department: "Sales",
      priority: "MEDIUM",
      status: "Pending Employee",
      assignedTo: "Michael Chen",
      created: "Dec 10, 2025",
      slaDue: "Dec 13, 05:02 PM",
    },
    {
      ticketId: "TKT-1012",
      title: "Questions about health insurance coverage",
      category: "Payroll & Benefits",
      employee: "Maria Garcia",
      department: "Finance",
      priority: "LOW",
      status: "Completed",
      assignedTo: "Sarah Johnson",
      created: "Dec 6, 2025",
      slaDue: "Dec 11, 05:02 PM",
    },
    {
      ticketId: "TKT-1013",
      title: "Performance review document not accessible",
      category: "Performance",
      employee: "James Wilson",
      department: "Operations",
      priority: "MEDIUM",
      status: "Pending ThirdParty",
      assignedTo: "Michael Chen",
      created: "Dec 8, 2025",
      slaDue: "Dec 12, 05:02 AM",
    },
    {
      ticketId: "TKT-1014",
      title: "Vacation leave approval pending for 2 weeks",
      category: "Leave & Attendance",
      employee: "Jennifer Lee",
      department: "Engineering",
      priority: "HIGH",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Nov 27, 2025",
      slaDue: "Nov 28, 05:02 PM",
    },
    {
      ticketId: "TKT-1015",
      title: "Remote work policy clarification",
      category: "Policy Questions",
      employee: "Christopher Davis",
      department: "HR",
      priority: "LOW",
      status: "Closed",
      assignedTo: "Emily Rodriguez",
      created: "Dec 1, 2025",
      slaDue: "Dec 6, 05:02 PM",
    },
    {
      ticketId: "TKT-1016",
      title: "Password reset for benefits portal",
      category: "IT Access",
      employee: "John Smith",
      department: "Engineering",
      priority: "CRITICAL",
      status: "Under Process",
      assignedTo: "Sarah Johnson",
      created: "Dec 14, 2025",
      slaDue: "Dec 14, 08:02 PM",
    },
  ]);

  const handleStatusChange = (newStatus, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, status: newStatus } : row
      )
    );
    showAlert(
      "success",
      `Status changed to ${newStatus} for ticket ${ticketId}`,
      "Status Updated"
    );
  };

  const handlePriorityChange = (newPriority, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, priority: newPriority } : row
      )
    );
    showAlert(
      "success",
      `Priority changed to ${newPriority} for ticket ${ticketId}`,
      "Priority Updated"
    );
  };

  const onSelectionChanged = () => {
    const rows = gridRef.current.api.getSelectedRows();
    setSelectedRows(rows);
  };

  const rowSelection = useMemo(() => {
    return {
      mode: "multiRow",
    };
  }, []);

  const adminId = "EmadOmar";

  const handleAssignToMe = (ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, assignedTo: adminId } : row
      )
    );
    showAlert(
      "success",
      `Ticket ${ticketId} assigned to ${adminId}`,
      "Assignment Successful"
    );
  };

  const handleAssignToOther = (memberName, ticketId) => {
    setRowData((prev) =>
      prev.map((row) =>
        row.ticketId === ticketId ? { ...row, assignedTo: memberName } : row
      )
    );
    showAlert(
      "success",
      `Ticket ${ticketId} assigned to ${memberName}`,
      "Assignment Successful"
    );
  };

  const handleBulkAssignToMe = () => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, assignedTo: adminId }
          : row
      )
    );
    showAlert(
      "success",
      `${selectedRows.length} ticket(s) assigned to ${adminId}`,
      "Bulk Assignment Successful"
    );
    setSelectedRows([]);
  };

  const handleBulkAssignToOther = (memberName) => {
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, assignedTo: memberName }
          : row
      )
    );
    showAlert(
      "success",
      `${selectedRows.length} ticket(s) assigned to ${memberName}`,
      "Bulk Assignment Successful"
    );
    setSelectedRows([]);
  };

  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkAssignToOtherModalOpen, setIsBulkAssignToOtherModalOpen] =
    useState(false);

  const handleDeleteTicket = (ticketId) => {
    setRowData((prev) => prev.filter((row) => row.ticketId !== ticketId));
    showAlert(
      "success",
      `Ticket ${ticketId} has been deleted`,
      "Ticket Deleted"
    );
  };

  const handleBulkDelete = () => {
    const count = selectedRows.length;
    setRowData((prev) =>
      prev.filter((r) => !selectedRows.some((s) => s.ticketId === r.ticketId))
    );
    showAlert(
      "success",
      `${count} ticket(s) have been deleted`,
      "Tickets Deleted"
    );
    setSelectedRows([]);
  };

  const handleBulkStatusChange = (newStatus) => {
    // Update all selected rows
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, status: newStatus }
          : row
      )
    );
    showAlert(
      "success",
      `Status changed to ${newStatus} for ${selectedRows.length} ticket(s)`,
      "Status Updated"
    );
    // Clear selection
    setSelectedRows([]);
  };

  const handleBulkPriorityChange = (newPriority) => {
    // Update all selected rows
    setRowData((prev) =>
      prev.map((row) =>
        selectedRows.some((s) => s.ticketId === row.ticketId)
          ? { ...row, priority: newPriority }
          : row
      )
    );
    showAlert(
      "success",
      `Priority changed to ${newPriority} for ${selectedRows.length} ticket(s)`,
      "Priority Updated"
    );
    // Clear selection
    setSelectedRows([]);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case "assignToMe":
        handleBulkAssignToMe();
        break;
      case "assignToOther":
        setIsBulkAssignToOtherModalOpen(true);
        break;
      case "changeStatus":
        setIsBulkStatusModalOpen(true);
        break;
      case "changePriority":
        setIsBulkPriorityModalOpen(true);
        break;
      case "delete":
        setIsBulkDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const bulkButtonRef = useRef(null);
  const [bulkMenuPosition, setBulkMenuPosition] = useState({ top: 0, left: 0 });
  const handleBulkButtonClick = (e) => {
    e.stopPropagation();
    if (bulkButtonRef.current) {
      const rect = bulkButtonRef.current.getBoundingClientRect();
      setBulkMenuPosition({
        top: rect.bottom + 4,
        left: rect.left - 150,
      });
    }
    setIsBulkMenuOpen(!isBulkMenuOpen);
  };

  const handleRowClick = (event) => {
    const ticketId = event.data.ticketId;
    window.open(`/admin/${adminId}/tickets/${ticketId}`, "_blank");
  };

  const isSLAOverdue = (createdDate) => {
    const created = new Date(createdDate);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff > 72;
  };

  const [quickFilterText, setQuickFilterText] = useState("");
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  const gridRef = useRef(null);

  const handleExport = () => {
    if (gridRef.current) {
      const api = gridRef.current.api;
      api.exportDataAsCsv({
        fileName: `${
          new Date().toISOString().split("T")[0]
        } Tickets Of ChatBot.csv`,
      });
    }
  };

  const totalTickets = rowData.length;

  // Update displayed count when filters change
  const onFilterChanged = () => {
    if (gridRef.current?.api) {
      const count = gridRef.current.api.getDisplayedRowCount();
      setDisplayedRowCount(count);
    }
  };

  // Initialize count when grid is ready
  const onGridReady = (params) => {
    const count = params.api.getDisplayedRowCount();
    setDisplayedRowCount(count);
  };

  const statusOrder = {
    "Pending Employee": 1,
    "Pending ThirdParty": 2,
    "Under Process": 3,
    New: 4,
    Completed: 5,
    Closed: 6,
  };

  const priorityOrder = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  const [colDefs] = useState([
    {
      field: "ticketId",
      headerName: "ID",
      filter: "agTextColumnFilter",
      tooltipField: "ticketId",
    },
    {
      field: "title",
      headerName: "TITLE",
      filter: "agTextColumnFilter",
      tooltipField: "title",
    },
    { field: "employee", headerName: "EMPLOYEE", filter: "agTextColumnFilter" },
    {
      field: "category",
      headerName: "CATEGORY",
      filter: "agTextColumnFilter",
      tooltipField: "category",
    },
    {
      field: "priority",
      headerName: "PRIORITY",
      width: 120,
      filter: "agTextColumnFilter",
      comparator: (valueA, valueB) =>
        priorityOrder[valueA] - priorityOrder[valueB],
      filterParams: {
        comparator: (a, b) => priorityOrder[a] - priorityOrder[b],
      },
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const getColorStyles = (priority) => {
          if (priority === "CRITICAL") {
            return { bg: "#fecaca", text: "#991b1b", border: "#f87171" };
          }
          if (priority === "HIGH") {
            return { bg: "#fed7aa", text: "#9a3412", border: "#fb923c" };
          }
          if (priority === "MEDIUM") {
            return { bg: "#dbeafe", text: "#1e40af", border: "#60a5fa" };
          }
          return { bg: "#d1fae5", text: "#065f46", border: "#4ade80" };
        };

        const colors = getColorStyles(params.value);

        return (
          <span
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "600",
              display: "block",
              lineHeight: "normal",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 170,
      filter: "agTextColumnFilter",
      comparator: (valueA, valueB) => statusOrder[valueA] - statusOrder[valueB],
      filterParams: {
        comparator: (a, b) => statusOrder[a] - statusOrder[b],
      },
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const getColorStyles = (status) => {
          switch (status) {
            case "Pending ThirdParty":
              return { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" };
            case "Pending Employee":
              return { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" };
            case "Under Process":
              return { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" };
            case "New":
              return { bg: "#ede9fe", text: "#6d28d9", border: "#a78bfa" };
            case "Completed":
              return { bg: "#d1fae5", text: "#065f46", border: "#34d399" };
            case "Closed":
              return { bg: "#e5e7eb", text: "#4b5563", border: "#9ca3af" };
            default:
              return { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
          }
        };

        const colors = getColorStyles(params.value);

        return (
          <span
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: "9999px",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: "600",
              display: "block",
              lineHeight: "normal",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "assignedTo",
      headerName: "ASSIGNED TO",
      filter: "agTextColumnFilter",
      minWidth: 170,
    },
    {
      field: "created",
      headerName: "CREATED",
      filter: "agDateColumnFilter",
    },
    {
      field: "slaDue",
      headerName: "SLA DUE",
      width: 150,
      filter: "agDateColumnFilter",
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params) => {
        const isOverdue = isSLAOverdue(params.data.created);
        const isCompleted =
          params.data.status === "Completed" || params.data.status === "Closed";

        if (isOverdue && !isCompleted) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                lineHeight: "1.2",
              }}
            >
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {params.value}
              </span>
              <span style={{ color: "#FF2C2C" }}>OVERDUE</span>
            </div>
          );
        }

        return (
          <span style={{ fontSize: "13px", color: "#374151" }}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "action",
      headerName: "ACTION",
      maxWidth: 105,
      cellStyle: {
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      },
      cellRenderer: (params) => (
        <ActionCellRenderer
          data={params.data}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onDelete={handleDeleteTicket}
          onAssignToMe={handleAssignToMe}
          onAssignToOther={handleAssignToOther}
        />
      ),
    },
  ]);

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Alert Notification */}
      <AlertNotification alert={alert} onClose={() => setAlert(null)} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ticket Management
            </h1>
            <p className="text-gray-600">View and manage support tickets</p>
          </div>
        </div>

        {/* Search & Export */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-md shadow"
            >
              Export
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          {/* Left: Tickets count */}
          <p className="text-gray-600 text-sm ml-3">
            {quickFilterText ? (
              <>
                Showing {displayedRowCount} of {totalTickets} ticket
                {totalTickets !== 1 ? "s" : ""}
              </>
            ) : (
              <>Showing {totalTickets} tickets</>
            )}
          </p>

          {/* Right: Bulk Action button */}
          {selectedRows.length > 0 && (
            <div className="relative">
              <button
                ref={bulkButtonRef}
                onClick={handleBulkButtonClick}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-md shadow mr-3"
              >
                Actions ({selectedRows.length})
                <EllipsisVertical size={16} />
              </button>

              {/* Reuse ActionMenu component */}
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

              {/* Bulk Status Modal */}
              <ChangeStatusModal
                isOpen={isBulkStatusModalOpen}
                onClose={() => setIsBulkStatusModalOpen(false)}
                currentStatus={selectedRows[0]?.status || "New"}
                onSave={handleBulkStatusChange}
                ticketId={`${selectedRows.length} tickets`}
              />

              {/* Bulk Priority Modal */}
              <ChangePriorityModal
                isOpen={isBulkPriorityModalOpen}
                onClose={() => setIsBulkPriorityModalOpen(false)}
                currentPriority={selectedRows[0]?.priority || "MEDIUM"}
                onSave={handleBulkPriorityChange}
                ticketId={`${selectedRows.length} tickets`}
              />

              {/* Bulk Delete Modal */}
              <DeleteConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                ticketId=""
                count={selectedRows.length}
              />

              {/* Bulk Assign to Other Modal */}
              <AssignToOtherModal
                isOpen={isBulkAssignToOtherModalOpen}
                onClose={() => setIsBulkAssignToOtherModalOpen(false)}
                onSave={handleBulkAssignToOther}
                ticketId={`${selectedRows.length} tickets`}
              />
            </div>
          )}
        </div>

        {/* Table AG GRID */}
        <div
          className="ag-theme-alpine mb-15"
          style={{ width: "100%", height: "800px" }}
        >
          <AgGridReact
            rowSelection={rowSelection}
            getRowHeight={() => 48}
            ref={gridRef}
            modules={[AllCommunityModule]}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            gridOptions={{
              theme: myTheme,
              enableCellTextSelection: true,
              ensureDomOrder: true,
            }}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            onRowDoubleClicked={(event) => handleRowClick(event)}
            onFilterChanged={onFilterChanged}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </div>
  );
}

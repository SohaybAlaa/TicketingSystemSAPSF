import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { User, Users } from "lucide-react";
import { TEAMS } from "../../data/mockData";

/**
 * Assign to Other Modal - Two-step selection (Team -> Member)
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {function} onSave - Callback when assignment is confirmed
 * @param {string} ticketId - ID of ticket being assigned
 */
export default function AssignToOtherModal({
  isOpen,
  onClose,
  onSave,
  ticketId,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

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

  const currentTeam = TEAMS.find((t) => t.teamId === selectedTeam);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.assignToOther.title", { ticketId })}
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
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {t("modals.assignToOther.step1")}
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {TEAMS.map((team) => (
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
                <div>{t(`teams.${team.teamId}`)}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {team.members.length} {t("modals.assignToOther.members")}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Member Selection */}
        {selectedTeam && currentTeam && (
          <div
            style={{
              animation: "fadeIn 0.2s ease-out",
              willChange: "opacity, transform",
            }}
          >
            <style>
              {`
                @keyframes fadeIn {
                 from { opacity: 0; transform: translateY(-6px); }
                 to   { opacity: 1; transform: translateY(0); }
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
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t("modals.assignToOther.step2")}
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
                    flexDirection: "row",
                    justifyContent: "start",
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
                  <User
                    size={18}
                    style={{
                      marginRight: isRTL ? "0" : "8px",
                      marginLeft: isRTL ? "8px" : "0",
                      color: "#6b7280",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      whiteSpace: "nowrap",
                      marginRight: isRTL ? "0" : "12px",
                      marginLeft: isRTL ? "12px" : "0",
                    }}
                  >
                    {t(`teamMembers.${member}`, member)}
                  </span>
                  <input
                    type="radio"
                    name="member"
                    value={member}
                    checked={selectedMember === member}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    style={{
                      cursor: "pointer",
                      accentColor: "#facc15",
                      outline: "none",
                      flexShrink: 0,
                    }}
                  />
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
          flexDirection: isRTL ? "row-reverse" : "row",
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
          {t("modals.assignToOther.cancel")}
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
          {t("modals.assignToOther.assign")}
        </button>
      </div>
    </Modal>
  );
}

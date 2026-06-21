import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { UserCog, Users } from "lucide-react";
import { TEAMS } from "@data/mockData";

/**
 * Assign to Other Modal - Two-step selection (Team -> Member or Team Only)
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
  const [assignToTeamOnly, setAssignToTeamOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeam(null);
      setSelectedMember(null);
      setAssignToTeamOnly(false);
    }
  }, [isOpen]);

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    setSelectedMember(null); // Reset member selection when team changes
    setAssignToTeamOnly(false); // Reset team-only flag
  };

  const handleSave = () => {
    if (!selectedTeam) return;
    
    if (selectedMember) {
      onSave(selectedMember, ticketId);
      onClose();
    } else {
      // Default to team-only if no member selected
      const currentTeam = TEAMS.find((t) => t.teamId === selectedTeam);
      onSave(currentTeam.teamName, ticketId);
      onClose();
    }
  };

  const isStep2Opened = selectedTeam !== null;

  const currentTeam = TEAMS.find((t) => t.teamId === selectedTeam);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.assignToOther.title", { ticketId })}
    >
      <div className="mb-6">
        {/* Step 1: Team Selection */}
        <div className={`mb-${selectedTeam ? "6" : "0"}`}>
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("modals.assignToOther.step1")}
          </label>
          <div className="flex gap-3">
            {TEAMS.map((team) => (
              <button
                key={team.teamId}
                onClick={() => handleTeamSelect(team.teamId)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-sm font-semibold text-gray-700 text-center ${selectedTeam === team.teamId 
                  ? "border-yellow-400 bg-yellow-50" 
                  : "border-gray-200 bg-white hover:bg-gray-50"}`}
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

        {/* Step 2: Member Selection or Team Only */}
        {selectedTeam && currentTeam && (
          <div
            style={{ willChange: "opacity, transform" }}
            className="animate-fadeInDown"
          >
            <label
              className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modals.assignToOther.step2")}
            </label>
            <div className="flex flex-col gap-2">
              {/* Team Only Option */}
              <label
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 justify-between ${assignToTeamOnly 
                  ? "border-yellow-400 bg-yellow-50" 
                  : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center">
                  <Users
                    size={18}
                    className={`text-gray-500 flex-shrink-0 ${isRTL ? "ml-2" : "mr-2"}`}
                  />
                  <span
                    className={`text-sm font-medium text-gray-700 whitespace-nowrap ${isRTL ? "ml-3" : "mr-3"}`}
                  >
                    {t("modals.assignToOther.teamOnly", "Assign to Team Only")}
                  </span>
                </div>
                <input
                  type="radio"
                  name="assignmentType"
                  checked={assignToTeamOnly}
                  onChange={() => {
                    setAssignToTeamOnly(true);
                    setSelectedMember(null);
                  }}
                  className="hidden-radio"
                />
              </label>

              {/* Member Options */}
              {currentTeam.members.map((member) => (
                <label
                  key={member}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 justify-between ${selectedMember === member 
                    ? "border-yellow-400 bg-yellow-50" 
                    : "border-gray-200 bg-white hover:bg-gray-50"}`}
                >
                  <div className="flex items-center">
                    <UserCog
                      size={18}
                      className={`text-gray-500 flex-shrink-0 ${isRTL ? "ml-2" : "mr-2"}`}
                    />
                    <span
                      className={`text-sm font-medium text-gray-700 whitespace-nowrap ${isRTL ? "ml-3" : "mr-3"}`}
                    >
                      {t(`teamMembers.${member}`, member)}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="assignmentType"
                    value={member}
                    checked={selectedMember === member}
                    onChange={(e) => {
                      setSelectedMember(e.target.value);
                      setAssignToTeamOnly(false);
                    }}
                    className="hidden-radio"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex gap-3 justify-end mt-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <button
          onClick={onClose}
          className="modal-cancel-button"
        >
          {t("modals.assignToOther.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={!isStep2Opened}
          className={isStep2Opened ? "modal-save-button" : "px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"}
        >
          {t("modals.assignToOther.assign")}
        </button>
      </div>
    </Modal>
  );
}

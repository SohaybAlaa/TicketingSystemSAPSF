import React from "react";
import FilterButton from "@ui/FilterButton";

/**
 * TeamFilter - A reusable component for team selection
 * 
 * @param {Object} props
 * @param {string} props.teamFilter - Current selected team filter
 * @param {Function} props.setTeamFilter - Function to update team filter
 * @param {Array} props.teams - Array of team objects
 * @param {boolean} props.isRTL - Whether the component should be displayed in RTL mode
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const TeamFilter = ({ teamFilter, setTeamFilter, teams, isRTL, t }) => {
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "", isRTL) =>
    `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div>
      <label
        className={rtlClass(
          "block text-md font-medium text-gray-700 mb-3",
          "font-bold text-base",
          isRTL
        )}
      >
        {t("analyticsMenu.filters.team", "Team")}
      </label>
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={teamFilter === "all"}
          onClick={() => setTeamFilter("all")}
          isRTL={isRTL}
        >
          {t("analyticsMenu.filters.allTeams", "All Teams")}
        </FilterButton>
        {teams.map((team) => (
          <FilterButton
            key={team.teamId}
            active={teamFilter === team.teamId}
            onClick={() => setTeamFilter(team.teamId)}
            isRTL={isRTL}
          >
            {t(`teams.${team.teamId}`, team.teamName)}
          </FilterButton>
        ))}
      </div>
    </div>
  );
};

export default TeamFilter;

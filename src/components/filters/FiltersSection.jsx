import React from "react";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
import TeamFilter from "@filters/TeamFilter";
import DateRangePicker from "@filters/DateRangePicker";

/**
 * FiltersSection - A reusable component for the analytics filters section
 * 
 * @param {Object} props
 * @param {boolean} props.showFilters - Whether to show the filters content
 * @param {Function} props.setShowFilters - Function to toggle filters visibility
 * @param {string} props.teamFilter - Current selected team filter
 * @param {Function} props.setTeamFilter - Function to update team filter
 * @param {Array} props.teams - Array of team objects
 * @param {string} props.dateFilter - Current selected date filter
 * @param {Function} props.setDateFilter - Function to update date filter
 * @param {string} props.customStartDate - Custom start date value
 * @param {Function} props.setCustomStartDate - Function to update custom start date
 * @param {string} props.customEndDate - Custom end date value
 * @param {Function} props.setCustomEndDate - Function to update custom end date
 * @param {boolean} props.showCustomPicker - Whether to show the custom date picker
 * @param {Function} props.setShowCustomPicker - Function to toggle custom date picker
 * @param {Function} props.getDateRangeText - Function to get formatted date range text
 * @param {Function} props.getTeamText - Function to get formatted team text
 * @param {boolean} props.isRTL - Whether the component should be displayed in RTL mode
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const FiltersSection = ({
  showFilters,
  setShowFilters,
  teamFilter,
  setTeamFilter,
  teams,
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  showCustomPicker,
  setShowCustomPicker,
  getDateRangeText,
  getTeamText,
  isRTL,
  t
}) => {
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "", isRTL) =>
    `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
      {/* Filters Header/Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-8 h-8 text-gray-700" />
          <h2
            className={rtlClass(
              "text-lg font-semibold text-gray-900",
              "font-bold text-xl",
              isRTL
            )}
          >
            {t("analyticsMenu.filters.title", "Filters")}
          </h2>
        </div>
        {showFilters ? (
          <ChevronUp className="w-8 h-8 text-gray-700" />
        ) : (
          <ChevronDown className="w-8 h-8 text-gray-700" />
        )}
      </button>

      {/* Filters Content */}
      {showFilters && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Filter */}
            <TeamFilter
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              teams={teams}
              isRTL={isRTL}
              t={t}
            />

            {/* Date Range Filter */}
            <DateRangePicker
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
              showCustomPicker={showCustomPicker}
              setShowCustomPicker={setShowCustomPicker}
              isRTL={isRTL}
              t={t}
            />
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p
              className={rtlClass(
                "text-sm text-gray-600",
                "font-medium text-base",
                isRTL
              )}
            >
              {t("analyticsMenu.filters.showingResults", "Showing results for")}{" "}
              <span
                className={rtlClass(
                  "font-semibold text-gray-900",
                  "font-bold",
                  isRTL
                )}
              >
                {getTeamText()}
              </span>{" "}
              •{" "}
              <span
                className={rtlClass(
                  "font-semibold text-gray-900",
                  "font-bold",
                  isRTL
                )}
              >
                {getDateRangeText()}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersSection;

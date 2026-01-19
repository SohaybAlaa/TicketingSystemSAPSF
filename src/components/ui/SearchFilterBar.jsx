import React from "react";
import { Search, ChevronDown, List, Grid } from "lucide-react";

/**
 * SearchFilterBar - A reusable component for search input, filters, and view mode toggles
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.setSearchQuery - Function to update search query
 * @param {string} props.filterType - Current filter type
 * @param {Function} props.setFilterType - Function to update filter type
 * @param {string} props.viewMode - Current view mode (e.g., "list", "grid")
 * @param {Function} props.setViewMode - Function to update view mode
 * @param {Array} props.filterOptions - Array of filter options [{value: "all", label: "All"}]
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {Function} props.t - Translation function
 * @param {React.ReactNode} props.viewModeToggle - Optional custom view mode toggle component
 * @returns {JSX.Element}
 */
const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  viewMode,
  setViewMode,
  filterOptions,
  isRTL,
  t,
  viewModeToggle,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className={`flex-1 relative ${isRTL ? "text-right" : ""}`}>
          <Search
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ${
              isRTL ? "right-3" : "left-3"
            }`}
          />
          <input
            type="text"
            placeholder={t("ticketsPage.search")}
            autoFocus={true}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2 border border-yellow-400 rounded-lg focus:ring-3 focus:ring-yellow-400 focus:border-transparent outline-none ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            }`}
          />
        </div>

        <div className="flex gap-2">
          {/* Filter Dropdown */}
          <div className="relative inline-flex">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`cursor-pointer appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-500 ${
                isRTL ? "pl-10 pr-4 font-semibold" : "pr-10 pl-4"
              }`}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 ${
                isRTL ? "left-3" : "right-3"
              }`}
            />
          </div>

          {/* View Mode Toggle */}
          {viewModeToggle || (
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                type="button"
                className={`p-2 rounded cursor-pointer ${
                  viewMode === "list"
                    ? "bg-yellow-200 shadow-sm"
                    : "hover:bg-yellow-100"
                }`}
              >
                <List className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                type="button"
                className={`p-2 rounded cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-yellow-200 shadow-sm"
                    : "hover:bg-yellow-100"
                }`}
              >
                <Grid className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;

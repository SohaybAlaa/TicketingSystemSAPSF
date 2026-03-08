import React, { useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import FilterButton from "@ui/FilterButton";

/**
 * DateRangePicker - A reusable component for date range selection
 * 
 * @param {Object} props
 * @param {string} props.dateFilter - Current selected date filter
 * @param {Function} props.setDateFilter - Function to update date filter
 * @param {string} props.customStartDate - Custom start date value
 * @param {Function} props.setCustomStartDate - Function to update custom start date
 * @param {string} props.customEndDate - Custom end date value
 * @param {Function} props.setCustomEndDate - Function to update custom end date
 * @param {boolean} props.showCustomPicker - Whether to show the custom date picker
 * @param {Function} props.setShowCustomPicker - Function to toggle custom date picker
 * @param {boolean} props.isRTL - Whether the component should be displayed in RTL mode
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const DateRangePicker = ({
  dateFilter,
  setDateFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  showCustomPicker,
  setShowCustomPicker,
  isRTL,
  t
}) => {
  const pickerRef = useRef(null);

  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "", isRTL) =>
    `${base} ${isRTL ? rtlExtra : ""}`.trim();

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowCustomPicker]);

  // Apply custom date range
  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateFilter("custom");
      setShowCustomPicker(false);
    }
  };

  return (
    <div>
      <label
        className={rtlClass(
          "block text-md font-medium text-gray-700 mb-3",
          "font-bold text-base",
          isRTL
        )}
      >
        {t("analyticsMenu.filters.dateRange", "Date Range")}
      </label>
      <div className="flex flex-wrap gap-2 relative">
        {/* Predefined date range buttons */}
        {["week", "month", "year"].map((period) => (
          <FilterButton
            key={period}
            active={dateFilter === period}
            onClick={() => setDateFilter(period)}
            isRTL={isRTL}
          >
            {t(
              `analyticsMenu.filters.${period}`,
              period.charAt(0).toUpperCase() + period.slice(1)
            )}
          </FilterButton>
        ))}
        
        {/* Custom date range button */}
        <FilterButton
          active={dateFilter === "custom"}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          isRTL={isRTL}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          {t("analyticsMenu.filters.custom", "Custom")}
        </FilterButton>

        {/* Custom date picker dropdown */}
        {showCustomPicker && (
          <div
            ref={pickerRef}
            className={`absolute top-full ${
              isRTL ? "left-0" : "right-0"
            } mt-2 bg-white rounded-lg border border-gray-300 shadow-2xl p-6 z-50 w-80`}
          >
            <h3
              className={rtlClass(
                "text-base font-semibold text-gray-900 mb-5",
                "font-bold text-lg",
                isRTL
              )}
            >
              {t("analyticsMenu.filters.selectDateRange", "Select Date Range")}
            </h3>
            <div className="space-y-4">
              {/* Start date input */}
              <div>
                <label
                  className={rtlClass(
                    "block text-sm font-medium text-gray-700 mb-2",
                    "font-bold",
                    isRTL
                  )}
                >
                  {t("analyticsMenu.filters.startDate", "Start Date")}
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              {/* End date input */}
              <div>
                <label
                  className={rtlClass(
                    "block text-sm font-medium text-gray-700 mb-2",
                    "font-bold",
                    isRTL
                  )}
                >
                  {t("analyticsMenu.filters.endDate", "End Date")}
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  className={rtlClass(
                    "flex-1 px-4 py-2.5 bg-yellow-500 text-black rounded-lg font-medium cursor-pointer hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors",
                    "font-bold",
                    isRTL
                  )}
                >
                  {t("analyticsMenu.filters.apply", "Apply")}
                </button>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className={rtlClass(
                    "flex-1 px-4 py-2.5 bg-white border border-gray-300 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
                    "font-bold",
                    isRTL
                  )}
                >
                  {t("analyticsMenu.filters.cancel", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;

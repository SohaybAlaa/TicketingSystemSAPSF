import React from "react";

/**
 * StatisticsCard - A reusable card component for displaying statistics
 * 
 * @param {Object} props
 * @param {string} props.title - The card title
 * @param {string|number} props.value - The value to display
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {string} [props.iconBgColor="bg-gray-100"] - Background color for the icon
 * @param {string} [props.iconColor="text-gray-700"] - Color for the icon
 * @param {string} [props.borderColor="border-gray-200"] - Border color when inactive
 * @param {string} [props.activeBorderColor="border-yellow-400"] - Border color when active
 * @param {boolean} [props.isActive=false] - Whether the card is in active state
 * @param {Function} [props.onClick] - Click handler for the card
 * @param {boolean} [props.isRTL=false] - Whether to use RTL layout
 * @returns {JSX.Element}
 */
const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-gray-100",
  iconColor = "text-gray-700",
  borderColor = "border-gray-200",
  activeBorderColor = "border-yellow-400",
  isActive = false,
  onClick,
  isRTL,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-lg shadow-sm border-2 hover-effect ${
        isActive ? activeBorderColor : `${borderColor} hover:${activeBorderColor}`
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={isRTL ? "text-right" : ""}>
          <div className="text-lg text-gray-600 font-semibold mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;

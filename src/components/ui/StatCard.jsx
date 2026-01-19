import React from "react";

/**
 * StatCard - A reusable card component for displaying statistics
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - The main value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.bgColor - Background color class for the icon
 * @param {string} props.iconColor - Color class for the icon
 * @param {boolean} props.alert - Whether to show the value in alert color
 * @param {Function} props.onClick - Click handler for the card
 * @returns {JSX.Element}
 */
export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = "bg-blue-100", 
  iconColor = "text-blue-600",
  alert = false,
  onClick 
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-6 hover-effect"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="!text-slate-600 !font-semibold mb-2">
            {title}
          </p>
          <p
            className={`!text-3xl !font-semibold !mb-1 ${
              alert && value > 0
                ? "!text-red-600"
                : "!text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`${bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

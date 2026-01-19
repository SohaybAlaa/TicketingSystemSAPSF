import React from "react";
import { useTranslation } from "react-i18next";

/**
 * MetricCard - A reusable component for displaying analytics metrics with percentage change
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - The main value to display
 * @param {number} props.change - Percentage change value
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.iconColor - Color for the icon (blue, green, yellow, etc.)
 * @param {boolean} props.isRTL - Whether the text direction is RTL
 * @param {Function} props.onClick - Optional click handler
 * @returns {JSX.Element}
 */
export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = "blue", 
  isRTL = false,
  onClick 
}) {
  const { t } = useTranslation();
  
  // Determine if the change is positive based on the context
  // For most metrics, positive change is good, but for some (like response time), negative change is good
  const isPositive = iconColor === "blue" || iconColor === "green" ? change >= 0 : change <= 0;
  
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "") => `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div 
      className="group bg-white rounded-lg border border-gray-200 p-6 hover-effect"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={rtlClass("!text-lg !font-bold !text-gray-600", "!font-bold")}>
          {title}
        </p>
        <Icon className={`w-7 h-7 text-${iconColor}-600 transition-transform duration-200 group-hover:scale-110 group-hover:text-${iconColor}-700`} />
      </div>
      <p className={rtlClass("!text-3xl !font-bold !text-gray-900 mb-1", "!font-extrabold !text-4xl")}>
        {value}
      </p>
      <p className={`!text-sm ${isRTL ? "!font-medium" : ""} ${isPositive ? "!text-green-600" : "!text-red-600"}`}>
        {change >= 0 ? "+" : ""}{change}% {t("analyticsMenu.metrics.fromLastMonth", "from last month")}
      </p>
    </div>
  );
}

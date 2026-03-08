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
  onClick,
  subLabel
}) {
  const { t } = useTranslation();
  
  // Determine if the change is positive based on the context
  // For most metrics, positive change is good, but for some (like response time), negative change is good
  const isPositive = iconColor === "blue" || iconColor === "green" ? change >= 0 : change <= 0;
  
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "") => `${base} ${isRTL ? rtlExtra : ""}`.trim();

  const iconColorMap = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    gray: 'bg-gray-50',
  };

  const titleColorMap = {
    blue: '!text-blue-600',
    green: '!text-green-600',
    yellow: '!text-yellow-600',
    orange: '!text-orange-600',
    red: '!text-red-600',
    purple: '!text-purple-600',
    gray: '!text-gray-600',
  };

  const glowShadowMap = {
    blue: '0 0 10px rgba(96,165,250,0.5), 0 0 10px rgba(59,130,246,0.3)',
    green: '0 0 10px rgba(74,222,128,0.5), 0 0 10px rgba(34,197,94,0.3)',
    yellow: '0 0 10px rgba(250,204,21,0.6), 0 0 10px rgba(234,179,8,0.4)',
    orange: '0 0 10px rgba(251,146,60,0.5), 0 0 10px rgba(249,115,22,0.3)',
    red: '0 0 10px rgba(248,113,113,0.5), 0 0 10px rgba(239,68,68,0.3)',
    purple: '0 0 10px rgba(192,132,252,0.5), 0 0 10px rgba(168,85,247,0.3)',
    gray: '0 0 10px rgba(156,163,175,0.4), 0 0 10px rgba(107,114,128,0.2)',
  };

  const borderColorMap = {
    blue: 'rgb(96,165,250)',
    green: 'rgb(74,222,128)',
    yellow: 'rgb(250,204,21)',
    orange: 'rgb(251,146,60)',
    red: 'rgb(248,113,113)',
    purple: 'rgb(192,132,252)',
    gray: 'rgb(156,163,175)',
  };

  return (
    <div 
      className="group relative bg-white rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-300 p-6 overflow-hidden cursor-pointer hover-effect"
      style={{
        '--glow-shadow': glowShadowMap[iconColor] || glowShadowMap.blue,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = glowShadowMap[iconColor] || glowShadowMap.blue;
        e.currentTarget.style.borderColor = borderColorMap[iconColor] || borderColorMap.blue;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-4">
          <div className="flex-1">
            <p className={rtlClass(`!text-md !font-bold ${titleColorMap[iconColor] || titleColorMap.blue} !uppercase !tracking-wider !mb-2`, "!font-bold")}>
              {title}
            </p>
            <p className={rtlClass("!text-3xl !font-bold !text-gray-900 !leading-none !tracking-wider", "!text-4xl")}>
              {value}
            </p>
          </div>
          <div className={`flex-shrink-0 p-4 rounded-full ${iconColorMap[iconColor] || iconColorMap.blue} shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`w-7 h-7 text-${iconColor}-600`} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {subLabel ? (
            <span className={`text-sm font-semibold ${titleColorMap[iconColor] || titleColorMap.blue}`}>
              {subLabel}
            </span>
          ) : (
            <>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${isPositive ? "bg-green-50" : "bg-red-50"}`}>
                <span className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                </span>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {t("analyticsMenu.metrics.fromLastMonth", "from last month")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";

/**
 * ActivityItem - A reusable component for displaying activity items
 * 
 * @param {Object} props
 * @param {string} props.title - Activity title (e.g. "New ticket assigned: TKT-2025-002")
 * @param {string} props.description - Activity description (e.g. "Unable to access HR portal - CRITICAL priority")
 * @param {string} props.time - Time information (e.g. "2h ago")
 * @param {string} props.color - Color for the bullet point (blue, amber, emerald, etc.)
 * @param {boolean} props.isLast - Whether this is the last item (no border)
 * @returns {JSX.Element}
 */
export default function ActivityItem({ title, description, time, color = "blue", isLast = false, onDoubleClick }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // Map color names to Tailwind classes to avoid dynamic class name issues
  const getBulletColorClass = () => {
    switch (color) {
      case "blue": return "bg-blue-500";
      case "amber": return "bg-amber-500";
      case "emerald": return "bg-emerald-500";
      case "red": return "bg-red-500";
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "purple": return "bg-purple-500";
      default: return "bg-black";
    }
  };

  return (
    <div className={`py-3 px-3 -mx-3 mb-2 rounded-lg transition-colors duration-200 hover:bg-yellow-50 cursor-pointer ${!isLast ? 'border-b border-slate-100' : ''}`} dir={isRTL ? "rtl" : "ltr"} onDoubleClick={onDoubleClick}>
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className={isRTL ? "ml-2 mt-1.5" : "mr-2 mt-1.5"}>
            <div className={`w-2 h-2 mt-0.5 rounded-full ${getBulletColorClass()}`}></div>
          </div>
          <div>
            <p className="!text-lg !font-semibold !text-gray-900">{title}</p>
            <p className="!text-md !text-gray-500 !mt-0.5">{description}</p>
          </div>
        </div>
        <span className={`!text-xs !text-gray-400 !whitespace-nowrap ${isRTL ? "mr-2" : "ml-2"}`}>{time}</span>
      </div>
    </div>
  );
}

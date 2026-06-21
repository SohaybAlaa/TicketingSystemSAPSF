import React from "react";
import { useTranslation } from "react-i18next";
import SectionHeader from "./SectionHeader";

/**
 * InfoMetricCard - A reusable component for displaying information metrics in the analytics dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ComponentType} props.icon - Lucide icon component for the header
 * @param {Array<{label: string, value: string, color: string, icon: React.Component}>} props.items - List of items to display
 * @param {boolean} props.isRTL - Whether the text direction is RTL
 * @returns {JSX.Element}
 */
export default function InfoMetricCard({ title, icon, items, isRTL = false }) {
  const { t } = useTranslation();
  
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "") => `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 lg:p-5 xl:p-6 h-full">
      <SectionHeader icon={icon} title={title} />
      <div className="space-y-3 lg:space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2 pb-3 lg:pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.icon && (
                <div className={`flex-shrink-0 p-1.5 lg:p-2 rounded-lg ${item.color?.replace('text-', 'bg-').replace('600', '100') || "bg-gray-100"}`}>
                  <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${item.color || "text-gray-600"}`} />
                </div>
              )}
              <p className={rtlClass("text-xs lg:text-sm font-medium text-gray-600 leading-tight", "font-semibold text-sm")}>
                {item.label}
              </p>
            </div>
            <span className={rtlClass("text-sm lg:text-base xl:text-lg font-bold whitespace-nowrap flex-shrink-0", "text-base xl:text-xl font-bold") + ` ${item.color || "text-gray-900"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

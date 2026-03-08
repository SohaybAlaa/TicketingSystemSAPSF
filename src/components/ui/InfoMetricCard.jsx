import React from "react";
import { useTranslation } from "react-i18next";

/**
 * InfoMetricCard - A reusable component for displaying information metrics in the analytics dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {Array<{label: string, value: string, color: string, icon: React.Component}>} props.items - List of items to display
 * @param {boolean} props.isRTL - Whether the text direction is RTL
 * @returns {JSX.Element}
 */
export default function InfoMetricCard({ title, items, isRTL = false }) {
  const { t } = useTranslation();
  
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "") => `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 h-full">
      <div className="mb-6">
        <h3 className={rtlClass("text-lg font-bold text-gray-900", "font-bold text-xl")}>
          {title}
        </h3>
        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2"></div>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
            <div className="flex items-start gap-3 flex-1">
              {item.icon && (
                <div className={`p-2 rounded-lg ${item.color?.replace('text-', 'bg-').replace('600', '100') || "bg-gray-100"}`}>
                  <item.icon className={`w-5 h-5 ${item.color || "text-gray-600"}`} />
                </div>
              )}
              <div className="flex-1">
                <p className={rtlClass("text-sm font-medium text-gray-600", "font-semibold text-base")}>
                  {item.label}
                </p>
              </div>
            </div>
            <span className={rtlClass("text-lg font-bold whitespace-nowrap", "text-xl font-bold") + ` ${item.color || "text-gray-900"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

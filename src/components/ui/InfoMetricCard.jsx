import React from "react";
import { useTranslation } from "react-i18next";

/**
 * InfoMetricCard - A reusable component for displaying information metrics in the analytics dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {Array<{label: string, value: string, color: string}>} props.items - List of items to display
 * @param {boolean} props.isRTL - Whether the text direction is RTL
 * @returns {JSX.Element}
 */
export default function InfoMetricCard({ title, items, isRTL = false }) {
  const { t } = useTranslation();
  
  // Helper function for RTL classes
  const rtlClass = (base, rtlExtra = "") => `${base} ${isRTL ? rtlExtra : ""}`.trim();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full hover-effect">
      <h3 className={rtlClass("mb-3 text-base font-semibold text-gray-900", "font-bold text-lg")}>
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className={rtlClass("text-sm text-gray-600", "font-medium")}>
              {item.label}
            </span>
            <span className={`text-sm font-medium ${item.color || "text-gray-900"} ${isRTL ? "font-bold" : ""}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";

/**
 * StatisticsCard - A reusable card component for displaying statistics.
 * Styled to match StatCard (dashboard cards) without the sparkline.
 *
 * @param {Object} props
 * @param {string} props.title - The card title
 * @param {string|number} props.value - The value to display
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {string} [props.iconBoxColor="#6366f1"] - Hex color for icon box and gradient accents
 * @param {string} [props.hoverShadow="rgba(99,102,241,0.3)"] - CSS shadow color on hover
 * @param {boolean} [props.isActive=false] - Whether the card is in active/selected state
 * @param {Function} [props.onClick] - Click handler
 * @param {boolean} [props.isRTL=false] - Whether to use RTL layout
 * @returns {JSX.Element}
 */
const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  iconBoxColor = "#6366f1",
  hoverShadow = "rgba(99,102,241,0.3)",
  isActive = false,
  onClick,
  isRTL,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 cursor-pointer overflow-hidden border-2 transition-transform duration-200 hover:scale-110 ${
        isActive ? 'border-opacity-60' : 'border-gray-100'
      }`}
      style={{
        background: isRTL
          ? `linear-gradient(225deg, ${iconBoxColor}50 0%, ${iconBoxColor}25 50%, #ffffff 100%)`
          : `linear-gradient(135deg, ${iconBoxColor}50 0%, ${iconBoxColor}25 50%, #ffffff 100%)`,
        boxShadow: isActive ? `0 10px 30px ${hoverShadow}` : "0 1px 6px rgba(0,0,0,0.06)",
        borderColor: isActive ? `${iconBoxColor}55` : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 10px 30px ${hoverShadow}`;
        e.currentTarget.style.borderColor = `${iconBoxColor}55`;
        const iconBox = e.currentTarget.querySelector('.icon-box');
        if (iconBox) iconBox.style.borderColor = `${iconBoxColor}99`;
        const icon = e.currentTarget.querySelector('.card-icon');
        if (icon) { icon.style.transition = 'transform 1s ease'; icon.style.transform = 'rotateY(360deg)'; }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isActive ? `0 10px 30px ${hoverShadow}` : "0 1px 6px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = isActive ? `${iconBoxColor}55` : "";
        const iconBox = e.currentTarget.querySelector('.icon-box');
        if (iconBox) iconBox.style.borderColor = `${iconBoxColor}40`;
        const icon = e.currentTarget.querySelector('.card-icon');
        if (icon) { icon.style.transition = 'none'; icon.style.transform = 'rotateY(0deg)'; }
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="icon-box flex-shrink-0 p-3.5 rounded-full shadow-sm"
          style={{ backgroundColor: `${iconBoxColor}20`, border: `1.5px solid ${iconBoxColor}40` }}
        >
          <Icon className="card-icon w-8 h-8" style={{ color: iconBoxColor }} />
        </div>
        <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">{title}</p>
          <p className="!text-3xl !font-extrabold !leading-none !text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;

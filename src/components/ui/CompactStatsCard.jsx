import React from 'react'

/**
 * CompactStatsCard - A compact horizontal statistics card for OrgStructureTab
 * Layout: icon - title - number (all on one line)
 * Shorter height with minimal gaps
 *
 * @param {Object} props
 * @param {string} props.title - The card title
 * @param {string|number} props.value - The value to display
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {string} [props.iconBoxColor="#6366f1"] - Hex color for icon box
 * @param {function} [props.onClick] - Click handler (for filter toggling)
 * @param {boolean} [props.active=false] - Whether this card's filter is active
 * @returns {JSX.Element}
 */
const CompactStatsCard = ({
  title,
  value,
  icon: Icon,
  iconBoxColor = "#6366f1",
  onClick,
  active = false,
  iconClassName = "icon-flip",
}) => {
  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-102 hover:border-opacity-60 cursor-pointer mt-3 mb-2"
      style={{
        background: active
          ? `linear-gradient(135deg, ${iconBoxColor}40 0%, ${iconBoxColor}25 50%, #ffffff 100%)`
          : `linear-gradient(135deg, ${iconBoxColor}15 0%, ${iconBoxColor}08 50%, #ffffff 100%)`,
        borderColor: active ? iconBoxColor + '80' : iconBoxColor + '30',
        boxShadow: active ? `0 0 0 2px ${iconBoxColor}40` : undefined,
      }}
      onMouseEnter={(e) => {
        const icon = e.currentTarget.querySelector('.icon-flip');
        if (icon) {
          icon.style.transition = 'transform 1s ease';
          icon.style.transform = 'rotateY(360deg)';
        }
        e.currentTarget.style.borderColor = iconBoxColor + '60';
        e.currentTarget.style.background = active
          ? `linear-gradient(135deg, ${iconBoxColor}50 0%, ${iconBoxColor}35 50%, #ffffff 100%)`
          : `linear-gradient(135deg, ${iconBoxColor}25 0%, ${iconBoxColor}15 50%, #ffffff 100%)`;
      }}
      onMouseLeave={(e) => {
        const icon = e.currentTarget.querySelector('.icon-flip');
        if (icon) {
          icon.style.transition = 'none';
          icon.style.transform = 'rotateY(0deg)';
        }
        e.currentTarget.style.borderColor = active ? iconBoxColor + '80' : iconBoxColor + '30';
        e.currentTarget.style.background = active
          ? `linear-gradient(135deg, ${iconBoxColor}40 0%, ${iconBoxColor}25 50%, #ffffff 100%)`
          : `linear-gradient(135deg, ${iconBoxColor}15 0%, ${iconBoxColor}08 50%, #ffffff 100%)`;
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${iconBoxColor}20`,
          border: `1px solid ${iconBoxColor}40`,
        }}
      >
        <Icon className={`${iconClassName} w-6 h-6`} style={{ color: iconBoxColor }} />
      </div>

      {/* Title and Value on same line */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className="text-xl font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
          {title}
        </span>
        <span className="text-xl font-bold text-gray-800 uppercase tracking-wide whitespace-nowrap">
          {value}
        </span>
      </div>

      {/* Active filter indicator */}
      {active && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: iconBoxColor }}
        />
      )}
    </div>
  )
}

export default CompactStatsCard

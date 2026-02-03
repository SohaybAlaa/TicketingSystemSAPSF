import { ArrowRight } from "lucide-react";

/**
 * PortalCard Component
 * 
 * A reusable interactive card component for the landing page portals.
 * Features hover effects, gradient overlays, and shine animations.
 * 
 * @param {string} title - Main title of the portal
 * @param {string} subtitle - Subtitle/description under the title
 * @param {string} description - Detailed description text
 * @param {React.Component} icon - Lucide icon component for the main icon
 * @param {React.Component} secondaryIcon - Lucide icon component for top-right corner
 * @param {Array} features - Array of feature objects with { Icon, text }
 * @param {string} ctaText - Call-to-action button text
 * @param {Function} onClick - Click handler for the card
 * @param {string} accentColor - Accent color for the card (e.g., 'yellow', 'red')
 * @param {boolean} isRTL - Right-to-left layout flag
 */
export default function PortalCard({
  title,
  subtitle,
  description,
  icon: Icon,
  secondaryIcon: SecondaryIcon,
  features = [],
  ctaText,
  onClick,
  accentColor = "yellow",
  isRTL = false,
}) {
  // Color mappings for different accent colors
  const colorClasses = {
    yellow: {
      gradient: "from-yellow-400 to-orange-500",
      gradientHover: "group-hover:from-yellow-400/30 group-hover:to-orange-500/30",
      iconBg: "from-yellow-400/20 to-orange-500/20",
      iconColor: "text-yellow-400",
      iconOpacity: "text-yellow-400/70",
      border: "hover:border-yellow-400/50",
      shadow: "hover:shadow-yellow-400/20",
      overlay: "group-hover:from-yellow-400/10 group-hover:via-yellow-400/5",
      titleHover: "group-hover:!text-yellow-400",
      secondaryIcon: "group-hover:text-yellow-400/50",
      cta: "text-yellow-400",
    },
    red: {
      gradient: "from-red-400 to-pink-500",
      gradientHover: "group-hover:from-red-400/30 group-hover:to-pink-500/30",
      iconBg: "from-red-400/20 to-pink-500/20",
      iconColor: "text-red-400",
      iconOpacity: "text-red-400/70",
      border: "hover:border-red-400/50",
      shadow: "hover:shadow-red-400/20",
      overlay: "group-hover:from-red-400/10 group-hover:via-red-400/5",
      titleHover: "group-hover:!text-red-400",
      secondaryIcon: "group-hover:text-red-400/50",
      cta: "text-red-400",
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.yellow;

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 text-left transition-all duration-500 hover:scale-[1.02] ${colors.border} hover:shadow-2xl ${colors.shadow}`}
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${accentColor}-400/0 via-${accentColor}-400/0 to-${accentColor}-400/0 ${colors.overlay} group-hover:to-transparent transition-all duration-500`} />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-gradient-to-br ${colors.iconBg} rounded-2xl ${colors.gradientHover} transition-all duration-300`}>
              <Icon className={`w-10 h-10 ${colors.iconColor}`} strokeWidth={2} />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className={`!text-3xl !font-bold !text-white ${colors.titleHover} transition-colors duration-300`}>
                {title}
              </h2>
              <p className="!text-gray-400 mt-1">{subtitle}</p>
            </div>
          </div>
          <SecondaryIcon className={`w-8 h-8 text-gray-600 ${colors.secondaryIcon} transition-colors`} />
        </div>

        {/* Description */}
        <p className={`!text-gray-300 !text-lg leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
          {description}
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {features.map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-gray-300">
              <item.Icon className={`w-5 h-5 ${colors.iconOpacity}`} />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`flex items-center gap-3 ${colors.cta} font-bold text-lg pt-4 group-hover:gap-5 transition-all`}>
          <span>{ctaText}</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </button>
  );
}

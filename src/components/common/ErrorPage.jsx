import { useTranslation } from "react-i18next";
import FullPageBackground from "./FullPageBackground";

export default function ErrorPage({ 
  icon, 
  title, 
  description, 
  tip,
  actions,
  badge,
  maxWidth = "lg" // lg for TicketNotFound, 2xl for 404
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <FullPageBackground maxWidth={maxWidth}>
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            {/* Optional badge */}
            {badge && (
              <div className="flex justify-center mb-6">
                {badge}
              </div>
            )}

            {/* Icon */}
            <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-red-500/20 border border-white/10 flex items-center justify-center shadow-lg">
              {icon}
            </div>

            {/* Text */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight !text-white tracking-wide">
                {title}
              </h1>
              <p className="mt-2 !text-sm !sm:text-base !text-white/70 !leading-relaxed">
                {description}
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer font-semibold whitespace-nowrap ${action.primary 
                      ? "text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20 transform hover:scale-[1.02] active:scale-[0.99]" 
                      : "text-white border border-white/15 bg-white/5 hover:bg-white/10"} transition ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="whitespace-nowrap">{action.text}</span>
                    {action.icon && (
                      <span className={isRTL && action.reverseIconInRTL ? "rotate-180" : ""}>
                        {action.icon}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Optional tip */}
              {tip && (
                <div className="mt-6 text-xs text-white/50">
                  {tip}
                </div>
              )}
              
              {/* Optional decorative dots (for 404 page) */}
              {actions.length > 2 && (
                <div className="mt-10 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:120ms]" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse [animation-delay:240ms]" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent rounded-b-3xl" />
        </div>
      </FullPageBackground>
  );
}

import { Globe } from "lucide-react";

/**
 * LanguageSwitcher Component
 * 
 * A reusable language toggle component that switches between English and Arabic.
 * Supports both desktop and mobile layouts.
 * 
 * @param {string} currentLanguage - Current active language ('en' or 'ar')
 * @param {Function} onLanguageChange - Callback function when language is changed
 * @param {boolean} isMobile - Flag to render mobile or desktop version
 */
export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  isMobile = false,
}) {
  if (isMobile) {
    // Mobile version - smaller, centered
    return (
      <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
          <Globe className="w-4 h-4 text-white/40" />
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition-all ${
              currentLanguage === "en"
                ? "bg-yellow-400 text-gray-900"
                : "text-white/60 hover:text-white"
            }`}
          >
            EN
          </button>
          <span className="text-white/20 text-xs">|</span>
          <button
            type="button"
            onClick={() => onLanguageChange("ar")}
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full transition-all ${
              currentLanguage === "ar"
                ? "bg-yellow-400 text-gray-900"
                : "text-white/60 hover:text-white"
            }`}
          >
            AR
          </button>
        </div>
      </div>
    );
  }

  // Desktop version - larger, positioned absolutely
  return (
    <div className="hidden lg:block">
      <div className="absolute top-8 right-8 flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
        <Globe className="w-5 h-5 text-white/40" />
        <button
          type="button"
          onClick={() => onLanguageChange("en")}
          className={`px-3 py-1 text-sm font-bold rounded-full transition-all ${
            currentLanguage === "en"
              ? "bg-yellow-400 text-gray-900"
              : "text-white/60 hover:text-white"
          }`}
        >
          EN
        </button>
        <span className="text-white/20">|</span>
        <button
          type="button"
          onClick={() => onLanguageChange("ar")}
          className={`px-3 py-1 text-sm font-bold rounded-full transition-all ${
            currentLanguage === "ar"
              ? "bg-yellow-400 text-gray-900"
              : "text-white/60 hover:text-white"
          }`}
        >
          العربية
        </button>
      </div>
    </div>
  );
}

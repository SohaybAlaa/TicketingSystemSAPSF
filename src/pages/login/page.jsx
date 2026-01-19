import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, Globe } from "lucide-react";
import FullPageBackground from "@components/common/FullPageBackground";

export default function Login() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (username === "emadomar" && password === "123456") {
        window.location.href = "/admin";
      } else {
        setError(t("login.error", "Invalid username or password"));
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <FullPageBackground maxWidth="md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/30 mb-4">
            <Lock className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="!text-4xl !sm:text-4xl !font-extrabold !text-white mb-2">
            {t("login.welcome", "Welcome Back")}
          </h1>
          <p className="!text-white/60 !text-sm">
            {t("login.subtitle", "Klenka - HR Support System")}
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label 
                  htmlFor="username" 
                  className={`block text-md font-bold text-white mb-2 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t("login.username", "Username")}
                </label>
                <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4" : "left-4"} text-white/40`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full ${isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"} py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition`}
                    placeholder={t("login.usernamePlaceholder", "Enter your username")}
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className={`block text-md font-bold text-white mb-2 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t("login.password", "Password")}
                </label>
                <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-4" : "left-4"} text-white/40`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${isRTL ? "pr-12 pl-12 text-right" : "pl-12 pr-12 text-left"} py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition`}
                    placeholder={t("login.passwordPlaceholder", "Enter your password")}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-4" : "right-4"} text-white/40 hover:text-white/70 transition`}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm !text-white/80">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/30 transform hover:scale-[1.02] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                    <span className="whitespace-nowrap">{t("login.loggingIn", "Logging in...")}</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">{t("login.signIn", "Sign In")}</span>
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Language Toggle */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <Globe className="w-5 h-5 text-white/40" />
                <button
                  type="button"
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                    i18n.language === "en"
                      ? "text-yellow-400"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  EN
                </button>
                <span className="text-white/20">|</span>
                <button
                  type="button"
                  onClick={() => changeLanguage("ar")}
                  className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                    i18n.language === "ar"
                      ? "text-yellow-400"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  AR
                </button>
              </div>
            </form>
          </div>

          {/* Bottom accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="!text-white/40 !text-xs">
            {t("login.footer", "© 2025 Klenka. All rights reserved.")}
          </p>
        </div>

        {/* Decorative dots */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:120ms]" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse [animation-delay:240ms]" />
        </div>
      </FullPageBackground>
  );
}

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bot, Shield, MessageSquare, Users, Sparkles, CheckCircle2, Calendar, Clock, DollarSign, Fingerprint, FileText, BarChart3, FolderOpen, Settings } from "lucide-react";
import PortalCard from "@components/landing/PortalCard";
import LanguageSwitcher from "@components/landing/LanguageSwitcher";
import AnimatedBackground from "@components/landing/AnimatedBackground";

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatedBackground />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-7xl w-full">
          {/* Desktop Navigation - Top Left & Right */}
          <div className="hidden lg:block">
            {/* Navigation Buttons - Top Left */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="hover-effect px-4 py-2 bg-yellow-400 text-gray-900 backdrop-blur-sm border border-yellow-400 rounded-full text-sm font-bold shadow-lg shadow-yellow-400/50"
              >
                {t("home")}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hover-effect px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                {t("login.loginTitle")}
              </button>
            </div>

            {/* Language Switcher - Top Right */}
            <LanguageSwitcher
              currentLanguage={i18n.language}
              onLanguageChange={changeLanguage}
              isMobile={false}
            />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            {/* Mobile Navigation Buttons - Above Icon */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => navigate('/')}
                className="hover-effect px-4 py-2 bg-yellow-400 text-gray-900 backdrop-blur-sm border border-yellow-400 rounded-full text-xs font-bold shadow-lg shadow-yellow-400/50"
              >
                {t("home")}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hover-effect px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium text-white/80"
              >
                {t("login.loginTitle")}
              </button>
            </div>

            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-16 h-16 text-slate-950" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Mobile Language Switcher - Below Icon */}
            <LanguageSwitcher
              currentLanguage={i18n.language}
              onLanguageChange={changeLanguage}
              isMobile={true}
            />

            {/* Heading */}
            <div className="space-y-4">
              <h1 className={`!text-5xl md:!text-7xl !font-black !text-transparent !bg-clip-text !bg-gradient-to-r from-white via-gray-100 to-gray-300 ${isRTL ? "!leading-normal py-3" : "!leading-tight"}`}>
                {t("landingPage.title")}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <p className={`!text-xl md:!text-2xl !text-gray-400 !font-medium ${isRTL ? "text-center" : ""}`}>
                  {t("landingPage.subtitle")}
                </p>
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* Subtitle */}
            <p className={`!text-lg !text-gray-400 max-w-3xl mx-auto leading-relaxed ${isRTL ? "text-center" : "text-center"}`}>
              {t("landingPage.description")}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {[
                t("landingPage.features.available247"),
                t("landingPage.features.nlpPowered"),
                t("landingPage.features.instantResponses"),
                t("landingPage.features.securePrivate")
              ].map((feature) => (
                <span key={feature} className="hover-effect px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Employee Portal */}
            <PortalCard
              title={t("landingPage.employeePortal.title")}
              subtitle={t("landingPage.employeePortal.subtitle")}
              description={t("landingPage.employeePortal.description")}
              icon={MessageSquare}
              secondaryIcon={Users}
              features={[
                { Icon: Calendar, text: t("landingPage.employeePortal.features.leaveRequests") },
                { Icon: Clock, text: t("landingPage.employeePortal.features.exitPermissions") },
                { Icon: DollarSign, text: t("landingPage.employeePortal.features.payrollQueries") },
                { Icon: Fingerprint, text: t("landingPage.employeePortal.features.attendanceTracking") },
                { Icon: FileText, text: t("landingPage.employeePortal.features.hrPolicies") },
                { Icon: Calendar, text: t("landingPage.employeePortal.features.vacationBalance") },
              ]}
              ctaText={t("landingPage.employeePortal.cta")}
              onClick={() => navigate('/login')}
              accentColor="yellow"
              isRTL={isRTL}
            />

            {/* Admin Panel */}
            <PortalCard
              title={t("landingPage.adminPanel.title")}
              subtitle={t("landingPage.adminPanel.subtitle")}
              description={t("landingPage.adminPanel.description")}
              icon={Shield}
              secondaryIcon={Shield}
              features={[
                { Icon: FileText, text: t("landingPage.adminPanel.features.ticketManagement") },
                { Icon: BarChart3, text: t("landingPage.adminPanel.features.analyticsDashboard") },
                { Icon: FolderOpen, text: t("landingPage.adminPanel.features.documentCenter") },
                { Icon: Users, text: t("landingPage.adminPanel.features.userManagement") },
                { Icon: BarChart3, text: t("landingPage.adminPanel.features.performanceMetrics") },
                { Icon: Settings, text: t("landingPage.adminPanel.features.systemSettings") },
              ]}
              ctaText={t("landingPage.adminPanel.cta")}
              onClick={() => navigate('/admin')}
              accentColor="red"
              isRTL={isRTL}
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-16 space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-700" />
              <span className="text-sm">{t("landingPage.footer.poweredBy")}</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-700" />
            </div>
            <p className="text-xs text-gray-600">
              {t("landingPage.footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

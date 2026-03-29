import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { checkAuth } from "@/utils/auth";
import {
  PanelRightOpen,
  PanelLeftOpen,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Ticket,
  ScrollText,
  LayoutGrid,
  Languages,
  LogOut,
  Settings,
} from "lucide-react";

export default function MainLayout({ children }) {
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Get current language from i18n
  const preferredLanguage = i18n.language;
  
  // Check if current page should hide sidebar (login page and root page)
  const isLoginPage = location.pathname === "/login";
  const isRootPage = location.pathname === "/";
  
  // Check authentication status and get user data
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuth();
        setIsAuthenticated(isAuthenticated);
        setUser(user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    verifyAuth();
  }, [location.pathname]);

  // Initialize language and direction on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") || "ar";
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, [i18n]);

  // Function to change language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang); //// Change the language in i18n (updates all translations)
    localStorage.setItem("preferredLanguage", lang); // save it in localStorage
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang; //Set the language attribute on the <html> tag
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const pathname = decodeURIComponent(location.pathname);

    const getPageTitle = () => {
      if (pathname === `/`) return "";
      if (pathname === `/admin`) return t("home");

      const ticketPrefix = `/admin/tickets/`;
      if (pathname.startsWith(ticketPrefix)) {
        const ticketId = pathname.slice(ticketPrefix.length); // Extract the ticket ID from the URL by removing the prefix
        return ticketId ? `${ticketId}` : t("tickets");
      }

      if (pathname === `/admin/tickets`) return t("tickets");
      if (pathname === `/admin/analytics`) return t("analytics");
      if (pathname === `/admin/documents`) return t("documents");
      if (pathname === `/admin/administrator`) return t("administrator");
      if (pathname === `/login`) return t("login.loginTitle");
      return "";
    };

    const pageTitle = getPageTitle();
    document.title = pageTitle
      ? `${pageTitle} - Klenka Chat Bot`
      : "Klenka Chat Bot";
  }, [location.pathname, t]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {!isLoginPage && !isRootPage && isAuthenticated && isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isLoginPage && !isRootPage && isAuthenticated && (
      <aside
        className={`
          bg-gradient-to-b from-[#1f2937] to-[#111827] 
          transition-all duration-300 ease-in-out flex-shrink-0
          ${
            isMobile
              ? `fixed inset-y-0 z-50 w-full ${
                  preferredLanguage === "ar" ? "right-0" : "left-0"
                }`
              : `fixed inset-y-0 z-40 ${
                  preferredLanguage === "ar" ? "right-0" : "left-0"
                }`
          }
          ${
            isSidebarOpen
              ? isMobile
                ? "translate-x-0"
                : "translate-x-0"
              : isMobile
              ? preferredLanguage === "ar"
                ? "translate-x-full"
                : "-translate-x-full"
              : preferredLanguage === "ar"
              ? "translate-x-full"
              : "-translate-x-full"
          }
          overflow-hidden shadow-2xl
        `}
        style={{ width: isSidebarOpen || isMobile ? "22rem" : "0" }}
      >
        {/* Sidebar Content - Fixed width */}
        <div
          className={`${
            isMobile ? "w-full" : "w-[22rem]"
          } h-full flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-7 border-b border-gray-700/80 shadow-lg shadow-yellow-400/5">
            <div className={isMobile ? "text-center flex-1" : "flex-1"}>
              <h2
                className={`!text-white !text-2xl font-bold drop-shadow-[0_0_10px_rgba(250,204,21,0.3)] mb-1.5 ${
                  preferredLanguage === "ar" ? "" : ""
                }`}
                style={
                  preferredLanguage === "ar" ? { letterSpacing: "0.05em" } : {}
                }
              >
                {t("hrSupport")}
              </h2>
              <p
                className={`!text-gray-300 !text-base ${
                  preferredLanguage === "ar" ? " mt-1" : ""
                }`}
                style={
                  preferredLanguage === "ar" ? { letterSpacing: "0.03em" } : {}
                }
              >
                {t("employeeSystem")}
              </p>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-3 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-125 ${
                preferredLanguage === "ar" ? "mr-2" : "ml-2"
              }`}
            >
              {preferredLanguage === "ar" ? (
                <PanelLeftOpen className="w-10 h-10 text-yellow-400 cursor-pointer drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              ) : (
                <PanelRightOpen className="w-10 h-10 text-yellow-400 cursor-pointer drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="px-7 py-6 border-b border-gray-700/80">
            <div
              className={`flex items-center ${
                preferredLanguage === "ar" ? "gap-4" : "gap-3.5"
              } ${isMobile ? "justify-center" : ""}`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-yellow-400/30 shadow-yellow-400/40 flex-shrink-0">
                <span
                  className={`text-gray-900 font-bold text-2xl leading-none ${
                    preferredLanguage === "ar" ? "-translate-y-1" : ""
                  }`}
                >
                  {(user?.username ? t(`usernames.${user.username}`, user.username) : t("adminName"))?.[0]?.toUpperCase()}
                </span>
              </div>
              <div
                className={`${isMobile ? "text-center" : ""} flex-1 min-w-0`}
              >
                <p
                  className={`!text-white !font-semibold !text-lg mb-0.5 truncate ${
                    preferredLanguage === "ar" ? "" : ""
                  }`}
                  style={
                    preferredLanguage === "ar"
                      ? { letterSpacing: "0.03em" }
                      : {}
                  }
                >
                  {user?.username ? t(`usernames.${user.username}`, user.username) : t("adminName")}
                </p>
                <p
                  className={`!text-gray-400 !text-sm ${
                    preferredLanguage === "ar" ? "" : ""
                  }`}
                  style={
                    preferredLanguage === "ar"
                      ? { letterSpacing: "0.02em" }
                      : {}
                  }
                >
                  {t("hrAdmin")}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5 py-6 overflow-y-auto">
            <ul className="space-y-2.5">
              {[
                {
                  to: `/admin`,
                  icon: LayoutGrid,
                  label: t("home"),
                  end: true,
                },
                {
                  to: `/admin/tickets`,
                  icon: Ticket,
                  label: t("tickets"),
                  end: false,
                },
                {
                  to: `/admin/analytics`,
                  icon: BarChart3,
                  label: t("analytics"),
                  end: false,
                },
                {
                  to: `/admin/documents`,
                  icon: ScrollText,
                  label: t("documents"),
                  end: false,
                },
                {
                  to: `/admin/administrator`,
                  icon: Settings,
                  label: t("administrator"),
                  end: false,
                },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `w-full flex items-center ${
                        preferredLanguage === "ar" ? "gap-3.5" : "gap-3.5"
                      } px-5 py-4 rounded-xl text-2xl transition-all duration-200 
                      ${isMobile ? "justify-center" : ""}
                      ${
                        isActive
                          ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/40 font-bold"
                          : "text-gray-300 hover:bg-gray-700/60 hover:text-white hover:shadow-sm hover:shadow-yellow-400/10 font-bold"
                      }
                      `
                    }
                    style={
                      preferredLanguage === "ar"
                        ? { letterSpacing: "0.03em" }
                        : {}
                    }
                  >
                    <item.icon
                      className={`${
                        preferredLanguage === "ar" ? "ml-0.5" : "mr-0.5"
                      } w-6 h-6 flex-shrink-0`}
                    />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
              
              {/* Logout Button */}
              <li>
                <button
                  onClick={async () => {
                    const { logout } = await import('./utils/auth');
                    await logout();
                  }}
                  className={`w-full flex items-center ${
                    preferredLanguage === "ar" ? "gap-3.5" : "gap-3.5"
                  } px-5 py-4 rounded-xl text-2xl transition-all duration-200 
                  ${isMobile ? "justify-center" : ""}
                  text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:shadow-sm hover:shadow-red-400/10 font-bold
                  `}
                  style={
                    preferredLanguage === "ar"
                      ? { letterSpacing: "0.03em" }
                      : {}
                  }
                >
                  <LogOut
                    className={`${
                      preferredLanguage === "ar" ? "ml-0.5" : "mr-0.5"
                    } w-6 h-6 flex-shrink-0 text-red-600`}
                  />
                  <span className="truncate text-red-600">{t("logout")}</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Language Toggle - Above Footer */}
          <div className="px-6 py-4 border-t border-gray-700 shadow-[0_-4px_20px_rgba(250,204,21,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Languages className="w-4 h-4" />
                <span className="!text-sm !font-medium">{t("language")}</span>
              </div>
            </div>
            <div className="relative bg-gray-800/50 p-1.5 rounded-2xl backdrop-blur-sm shadow-inner">
              {/* Buttons */}
              <div className="relative flex gap-2">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`
                    flex-1 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer
                    transition-all duration-400 ease-out relative z-10
                    ${
                      preferredLanguage === "en"
                        ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/50"
                        : "text-gray-400 hover:text-gray-300"
                    }
                  `}
                  title="English"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`
                    flex-1 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer
                    transition-all duration-400 ease-out relative z-10
                    ${
                      preferredLanguage === "ar"
                        ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/50"
                        : "text-gray-400 hover:text-gray-300"
                    }
                  `}
                  title="العربية"
                >
                  العربية
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 border-t border-gray-700/80">
            <p className="!text-gray-400 display-">V0.1</p> 
            <p
              className={`!text-gray-500 !text-xs !leading-relaxed ${
                preferredLanguage === "ar" ? "" : ""
              }`}
              style={
                preferredLanguage === "ar"
                  ? {
                      letterSpacing: "0.01em",
                      lineHeight: "1.6",
                    }
                  : {}
              }
            >
              {t("footer.title")}
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </aside>
      )
      }

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col overflow-hidden min-w-0 relative transition-all duration-300"
        style={{
          marginLeft:
            !isLoginPage && !isRootPage && isAuthenticated && !isMobile && isSidebarOpen && preferredLanguage === "en"
              ? "22rem"
              : "0",
          marginRight:
            !isLoginPage && !isRootPage && isAuthenticated && !isMobile && isSidebarOpen && preferredLanguage === "ar"
              ? "22rem"
              : "0",
        }}
      >
        {/* Floating Toggle Button */}
        {!isLoginPage && !isRootPage && isAuthenticated && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`
              fixed z-50 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 
              shadow-lg shadow-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/60 
              transition-all duration-200 group cursor-pointer
              ${
                isMobile
                  ? preferredLanguage === "ar"
                    ? "top-[25%] right-0 rounded-l-xl px-2 py-7"
                    : "top-[25%] left-0 rounded-r-xl px-2 py-7"
                  : preferredLanguage === "ar"
                  ? "right-0 top-1/2 -translate-y-1/2 rounded-l-xl px-2 py-10"
                  : "left-0 top-1/2 -translate-y-1/2 rounded-r-xl px-2 py-10"
              }
            `}
          >
            {preferredLanguage === "ar" ? (
              <ChevronLeft
                className={`group-hover:-translate-x-1 transition-transform ${
                  isMobile ? "w-5 h-5" : "w-6 h-6"
                }`}
              />
            ) : (
              <ChevronRight
                className={`group-hover:translate-x-1 transition-transform ${
                  isMobile ? "w-5 h-5" : "w-6 h-6"
                }`}
              />
            )}
          </button>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable' }}>{children}</main>
      </div>
    </div>
  );
}

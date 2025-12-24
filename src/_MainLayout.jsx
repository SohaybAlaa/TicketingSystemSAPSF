import { useEffect, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  PanelRightOpen,
  ChevronRight,
  BarChart3,
  Ticket,
  ScrollText,
  LayoutGrid,
} from "lucide-react";

export default function MainLayout({ children }) {
  const location = useLocation();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const adminId = params.adminId || "Emad Omar";

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
      if (pathname === `/admin/${adminId}`) return "Home";

      const ticketPrefix = `/admin/${adminId}/tickets/`;
      if (pathname.startsWith(ticketPrefix)) {
        const ticketId = pathname.slice(ticketPrefix.length);
        return ticketId ? `${ticketId}` : "Tickets";
      }

      if (pathname === `/admin/${adminId}/tickets`) return "Tickets";
      if (pathname === `/admin/${adminId}/analytics`) return "Analytics";
      if (pathname === `/admin/${adminId}/documents`) return "Documents";
      return "";
    };

    const pageTitle = getPageTitle();
    document.title = pageTitle
      ? `${pageTitle} - Klenka Chat Bot`
      : "Klenka Chat Bot";
  }, [location.pathname, adminId]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-gradient-to-b from-[#1f2937] to-[#111827] 
          transition-all duration-300 ease-in-out flex-shrink-0
          ${isMobile ? "fixed inset-y-0 left-0 z-50 w-full" : "relative"}
          ${
            isSidebarOpen
              ? isMobile
                ? "translate-x-0"
                : "w-80"
              : isMobile
              ? "-translate-x-full"
              : "w-0"
          }
          overflow-hidden shadow-2xl
        `}
      >
        {/* Sidebar Content - Fixed width */}
        <div className={`${isMobile ? "w-full" : "w-80"} h-full flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className={isMobile ? "text-center flex-1 ml-22" : ""}>
              <h2 className="text-white text-3xl">HR Support</h2>
              <p className="text-gray-300 text-base">Employee System</p>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-4 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <PanelRightOpen className="w-8 h-8 text-yellow-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-700">
            <div
              className={`flex items-center gap-3 ${
                isMobile ? "justify-center" : ""
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-yellow-400/30">
                <span className="text-gray-900 font-semibold text-2xl">
                  {adminId
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className={isMobile ? "text-center" : ""}>
                <p className="text-white font-medium text-lg">{adminId}</p>
                <p className="text-gray-300 text-md">HR Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {[
                {
                  to: `/admin/${adminId}`,
                  icon: LayoutGrid,
                  label: "Home",
                  end: true,
                },
                {
                  to: `/admin/${adminId}/tickets`,
                  icon: Ticket,
                  label: "Tickets",
                  end: false,
                },
                {
                  to: `/admin/${adminId}/analytics`,
                  icon: BarChart3,
                  label: "Analytics",
                  end: false,
                },
                {
                  to: `/admin/${adminId}/documents`,
                  icon: ScrollText,
                  label: "Documents",
                  end: false,
                },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `w-full flex items-center px-4 py-3 rounded-xl text-2xl transition-all duration-200 
                      ${isMobile ? "justify-center" : ""}
                      ${
                        isActive
                          ? "bg-yellow-400 text-gray-900 shadow-md font-medium"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <p className="text-gray-300 text-sm">v1</p>
            <p className="text-gray-500 text-xs mt-1">
              Klenka - HR Support System <br />© 2025 All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {/* Floating Toggle Button - Fixed on left center */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`
              fixed z-50 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 
              shadow-lg hover:shadow-xl transition-all duration-200 group
              ${
                isMobile
                  ? "top-[25%] left-0 rounded-r-lg px-1 py-6"
                  : "left-0 top-1/2 -translate-y-1/2 rounded-r-lg px-1.5 py-8"
              }
            `}
          >
            <ChevronRight
              className={`group-hover:translate-x-1 transition-transform ${
                isMobile ? "w-4 h-4" : "w-5 h-5"
              }`}
            />
          </button>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

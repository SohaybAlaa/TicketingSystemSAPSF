import { useEffect, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  PanelRightOpen,
  PanelLeftOpen,
  BarChart3,
  Ticket,
  LayoutGrid,
} from "lucide-react";

export default function MainLayout({ children }) {
  const location = useLocation();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const adminId = params.adminId || "EmadOmar";

  useEffect(() => {
    // Map routes to page titles
    const getPageTitle = () => {

      if (location.pathname === `/`) return "";
      if (location.pathname === `/admin/${adminId}`) return "Home";
      if (location.pathname.startsWith(`/admin/${adminId}/tickets`))
        return "Tickets";
      if (location.pathname === `/admin/${adminId}/analytics`)
        return "Analytics";
      return;
    };

    const pageTitle = getPageTitle();
    document.title = pageTitle
      ? `${pageTitle} - Klenka Chat Bot`
      : 'Klenka Chat Bot';
  }, [location.pathname, adminId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-[#1f2937] to-[#111827] transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? "w-full lg:w-80" : "w-0"
          } overflow-hidden`}
      >
        {/* Sidebar Content */}
        <div className="min-h-full w-full lg:w-80 flex flex-col">
          {/* Header/Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="w-full lg:w-auto text-center lg:text-left">
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
            <div className="flex flex-col lg:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-yellow-400/30">
                <span className="text-gray-900 font-semibold text-2xl">
                  {adminId
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-white font-medium text-base">{adminId}</p>
                <p className="text-gray-300 text-sm">HR Admin</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
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
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `w-full flex items-center px-4 py-3 rounded-xl text-2xl transition-all duration-200 
                      justify-center lg:justify-start 
                      ${isActive
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
          <div className="p-6 border-t border-gray-700 text-center lg:text-left">
            <p className="text-gray-300 text-sm">v1</p>
            <p className="text-gray-500 text-xs mt-1">
              Klenka - HR Support System <br />© 2025 All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SECTION */}
        <header className="sticky top-0 z-10 p-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-yellow-400 p-2 rounded-lg text-gray-900 hover:bg-yellow-500 active:bg-yellow-600 shadow-md hover:shadow-lg transition-all duration-200 font-semibold w-fit"
            >
              <PanelLeftOpen className="w-6 h-6" />
            </button>
          )}
        </header>

        {/* Main page content  */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

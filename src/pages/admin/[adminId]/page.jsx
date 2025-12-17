import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";

// mockup data for the cards
const cards = [
  {
    title: "Assigned to Me",
    value: "4",
    icon: Inbox,
    color: "blue",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    title: "My Team Tickets",
    value: "5",
    icon: Users,
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    title: "New Tickets",
    value: "6",
    icon: TrendingUp,
    color: "green",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    title: "Under Process",
    value: "7",
    icon: Clock,
    color: "yellow",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    borderColor: "border-yellow-200",
  },
  {
    title: "SLA Breached",
    value: "8",
    icon: AlertCircle,
    color: "red",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
    alert: true,
  },
  {
    title: "Closed (30 days)",
    value: "9",
    icon: CheckCircle2,
    color: "gray",
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600",
    borderColor: "border-gray-200",
  },
];
export default function Admin() {
  const adminId = "EmadOmar";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HR Support Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {adminId}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/admin/${adminId}/tickets`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-600 mb-2">{card.title}</p>
                    <p
                      className={`text-3xl font-semibold mb-1 ${
                        card.alert && card.value > 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`${card.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-15 mb-8">
          <h2 className="text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(`/admin/${adminId}/tickets`)}
              className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              View All Tickets
            </button>
            <button
              onClick={() => navigate(`/admin/${adminId}/tickets`)}
              className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:border-yellow-400 hover:text-gray-900 transition-all duration-200 font-medium"
            >
              View SLA Breached
            </button>
            <button
              onClick={() => navigate(`/admin/${adminId}/analytics`)}
              className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:border-yellow-400 hover:text-gray-900 transition-all duration-200 font-medium"
            >
              View Analytics
            </button>
            <button
              onClick={() => navigate(`/admin/${adminId}/documents`)}
              className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:border-yellow-400 hover:text-gray-900 transition-all duration-200 font-medium"
            >
              View Documents
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">
                  New ticket assigned: TKT-2025-002
                </p>
                <p className="text-slate-600">
                  Unable to access HR portal - CRITICAL priority
                </p>
              </div>
              <span className="text-slate-500 text-sm">2h ago</span>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">
                  SLA breach alert: TKT-2025-006
                </p>
                <p className="text-slate-600">
                  Resolution time exceeded for vacation leave approval
                </p>
              </div>
              <span className="text-slate-500 text-sm">6h ago</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-slate-900 font-medium">
                  Ticket completed: TKT-2025-004
                </p>
                <p className="text-slate-600">
                  Health insurance coverage query resolved
                </p>
              </div>
              <span className="text-slate-500 text-sm">1d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

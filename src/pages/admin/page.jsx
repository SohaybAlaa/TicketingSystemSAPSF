import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { checkAuth } from "@/utils/auth";
import {
  AlertTriangle,
  TicketX,
  LoaderCircle,
  UserRoundPen,
  TicketPlus,
  Users,
  CalendarClock,
  Zap,
} from "lucide-react";

import AdminLayout from "@layouts/AdminLayout";
import StatCard from "@ui/StatCard";
import ActionButton from "@ui/ActionButton";
import ActivityItem from "@ui/ActivityItem";
import SectionHeader from "@ui/SectionHeader";

// Card definitions with icons/colors — values come from API
const cardDefs = [
  {
    key: "assignedToMe",
    title: "Assigned to Me",
    icon: UserRoundPen,
    iconBoxColor: "#22c55e",
    sparkColor: "#86efac",
    hoverShadow: "rgba(34,197,94,0.3)",
    animationType: "flip",
  },
  {
    key: "underProcess",
    title: "Under Process",
    icon: LoaderCircle,
    iconBoxColor: "#3b82f6",
    sparkColor: "#93c5fd",
    hoverShadow: "rgba(59,130,246,0.3)",
    animationType: "spin",
  },
  {
    key: "newTickets",
    title: "New Tickets",
    icon: TicketPlus,
    iconBoxColor: "#8b5cf6",
    sparkColor: "#c4b5fd",
    hoverShadow: "rgba(139,92,246,0.3)",
    badgeKey: "newTickets",
    animationType: "flip",
  },
  {
    key: "myTeamTickets",
    title: "My Team Tickets",
    icon: Users,
    iconBoxColor: "#eab308",
    sparkColor: "#fde047",
    hoverShadow: "rgba(234,179,8,0.3)",
    animationType: "flip",
  },
  {
    key: "slaBreached",
    title: "SLA Breached",
    icon: AlertTriangle,
    iconBoxColor: "#ef4444",
    sparkColor: "#fca5a5",
    hoverShadow: "rgba(239,68,68,0.3)",
    alert: true,
    animationType: "flip",
  },
  {
    key: "closed30Days",
    title: "Closed (30 days)",
    icon: TicketX,
    iconBoxColor: "#6b7280",
    sparkColor: "#d1d5db",
    hoverShadow: "rgba(107,114,128,0.3)",
    animationType: "flip",
  },
];

// Map change_type to activity color (Dot color)
const activityColorMap = {
  status: "blue", 
  priority: "amber",
  assignment: "emerald",
};

// Compute relative time string at Recent activity x Hrs ago , x Min ago
function getRelativeTime(dateStr, t) {
  const now = new Date(); // Current time
  const date = new Date(dateStr); // Date of the activity
  const diffMs = now - date; // Time difference in milliseconds
  const diffMin = Math.floor(diffMs / 60000); // 60000 ms = 1 min
  const diffHrs = Math.floor(diffMs / 3600000); // 3600000 ms = 1 hr
  const diffDays = Math.floor(diffMs / 86400000); // 86400000 ms = 1 day

  if (diffMin < 1) return t("dashboard.recentActivity.time.justNow"); // Less than 1 min
  if (diffMin < 60) return t("dashboard.recentActivity.time.minutesAgo", { count: diffMin }); // Less than 1 hr
  if (diffHrs < 24) return t("dashboard.recentActivity.time.hoursAgo", { count: diffHrs }); // Less than 1 day
  return t("dashboard.recentActivity.time.daysAgo", { count: diffDays }); // More than 1 day
}

// Build activity title from change type
function getActivityTitle(item, t) {
  const id = item.ticketId; // Ticket ID
  const rawValue = item.newValue; // Raw value of the change
  switch (item.changeType) { // Change type
    case "status": // Status change Example: Open -> In Progress
      return t("dashboard.recentActivity.statusChanged", { value: t(`ticketsPage.statuses.${rawValue}`, rawValue), id });
    case "priority": // Priority change Example: Low -> Medium
      return t("dashboard.recentActivity.priorityChanged", { value: t(`ticketsPage.priorities.${rawValue}`, rawValue), id });
    case "assignment": // Assignment change Example: User A -> User B
      return t("dashboard.recentActivity.assignmentChanged", { value: rawValue, id });
    default:
      return `${item.changeType} changed on ${id}`; 
  }
}

export default function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // navigate to different pages
  const [user, setUser] = useState(null); // logged in user
  const [stats, setStats] = useState(null); // dashboard stats
  const [trends, setTrends] = useState({}); // dashboard trends
  const [recentActivity, setRecentActivity] = useState([]); // recent activity
  const [isLoading, setIsLoading] = useState(true); // loading state

  // Fetch logged-in user data on every mount (navigating back re-mounts)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await checkAuth(); // check auth
        setUser(user); // set user
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []); // run only once

  // Fetch dashboard data from API once user is loaded
  useEffect(() => {
    if (!user) return; // if no user, return

    const fetchDashboard = async () => {
      try {
        setIsLoading(true); // set loading state
        const userId = user.id; // get user id
        const userTeam = user.team || ''; // get user team
        const response = await fetch(`/api/public/dashboard?userId=${userId}&team=${encodeURIComponent(userTeam)}`, { cache: 'no-store' }); // fetch dashboard data, no cache

        if (!response.ok) { // if response is not ok
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // get data

        if (data.success) { // if success
          setStats(data.stats); // set stats
          setTrends(data.trends || {}); // set trends
          setRecentActivity(data.recentActivity || []); // set recent activity
        }
      } catch (error) { // catch error
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user]); // run when user changes

  // Get translated username at top of page subtitle or fallback to adminName
  const adminName = user?.username 
    ? t(`usernames.${user.username}`, user.username) 
    : t("adminName");

  return (
      <AdminLayout
    title={t("dashboard.title")}
    subtitle={
      <>
        {t("dashboard.welcome", { name: "" })}
        <span className="font-bold text-yellow-500 text-lg">
          {adminName}
        </span>
      </>
    }
  >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardDefs.map((card) => ( // map cardDefs to StatCard
          <StatCard
            key={card.key}
            title={t(`dashboard.cards.${card.title}`)}
            value={isLoading ? "..." : (stats?.[card.key] ?? 0)}
            icon={card.icon}
            iconBoxColor={card.iconBoxColor}
            sparkColor={card.sparkColor}
            hoverShadow={card.hoverShadow}
            alert={card.alert}
            trend={(() => { const t = trends[card.key]; return (t && t.some(v => v > 0)) ? t : card.trend; })()}
            animationType={card.animationType}
            badge={card.badgeKey && !isLoading ? (stats?.[card.badgeKey] ?? undefined) : undefined}
            onClick={() => navigate(`/admin/tickets?filter=${card.key}`)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-15 mb-8">
        <SectionHeader icon={Zap} title={t("dashboard.quickActions.title")} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionButton onClick={() => navigate(`/admin/tickets`)}>
            {t("dashboard.quickActions.viewAllTickets")}
          </ActionButton>
          
          <ActionButton onClick={() => navigate(`/admin/tickets?filter=slaBreached`)}>
            {t("dashboard.quickActions.viewSLABreached")}
          </ActionButton>
          
          <ActionButton onClick={() => navigate(`/admin/analytics`)}>
            {t("dashboard.quickActions.viewAnalytics")}
          </ActionButton>
          
          <ActionButton onClick={() => navigate(`/admin/documents`)}>
            {t("dashboard.quickActions.viewDocuments")}
          </ActionButton>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <SectionHeader icon={CalendarClock} title={t("dashboard.recentActivity.title")} />
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
              <p className="text-gray-700 font-medium">{t("dashboard.recentActivity.loading")}</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CalendarClock className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium">{t("dashboard.recentActivity.noActivity")}</p>
            </div>
          ) : (
            recentActivity.map((item, index) => ( // map recentActivity to ActivityItem
              <ActivityItem
                key={item.id}
                title={getActivityTitle(item, t)}
                description={`${item.ticketTitle} — ${t("dashboard.recentActivity.byUser", { name: item.changedByName })}`}
                time={getRelativeTime(item.changedAt, t)}
                color={activityColorMap[item.changeType] || "blue"}
                isLast={index === recentActivity.length - 1}
                onDoubleClick={() => navigate(`/admin/tickets/${item.ticketId}`)}
              />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

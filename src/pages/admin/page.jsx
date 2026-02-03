import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { checkAuth } from "@/utils/auth";

import { cards } from "@data/mockData";
import AdminLayout from "@layouts/AdminLayout";
import StatCard from "@ui/StatCard";
import ActionButton from "@ui/ActionButton";
import ActivityItem from "@ui/ActivityItem";

export default function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch logged-in user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await checkAuth();
        setUser(user);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Get translated username or fallback to adminName
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
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.title}
              title={t(`dashboard.cards.${card.title}`)}
              value={card.value}
              icon={Icon}
              bgColor={card.bgColor}
              iconColor={card.iconColor}
              alert={card.alert}
              onClick={() => navigate(`/admin/tickets`)}
            />
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-15 mb-8">
        <h2 className="mb-4">
          {t("dashboard.quickActions.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionButton onClick={() => navigate(`/admin/tickets`)}>
            {t("dashboard.quickActions.viewAllTickets")}
          </ActionButton>
          
          <ActionButton onClick={() => navigate(`/admin/tickets`)}>
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
        <h2 className="text-base font-medium mb-4">
          {t("dashboard.recentActivity.title")}
        </h2>
        <div>
          <ActivityItem
            title={t("dashboard.recentActivity.newTicket", { id: "TKT-2025-002" })}
            description={t("dashboard.recentActivity.portalAccess")}
            time={t("dashboard.recentActivity.time.hoursAgo", { count: 2 })}
            color="blue"
          />
          
          <ActivityItem
            title={t("dashboard.recentActivity.slaAlert", { id: "TKT-2025-006" })}
            description={t("dashboard.recentActivity.vacationLeave")}
            time={t("dashboard.recentActivity.time.hoursAgo", { count: 6 })}
            color="amber"
          />
          
          <ActivityItem
            title={t("dashboard.recentActivity.ticketCompleted", { id: "TKT-2025-004" })}
            description={t("dashboard.recentActivity.healthInsurance")}
            time={t("dashboard.recentActivity.time.daysAgo", { count: 1 })}
            color="emerald"
            isLast={true}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

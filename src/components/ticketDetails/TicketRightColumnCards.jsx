import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  AlertTriangle,
  User,
  UserCog,
  Building2,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import Tag from "@components/ui/Tag";

export default function TicketRightColumnCards({
  ticket,
  localStatus,
  localPriority,
  handleStatusChange,
  handlePriorityChange,
}) {
  const { t } = useTranslation();

  const formatDateTime = (dateString) => {
    if (!dateString) {
      return "Not set";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Not set";
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status & Priority */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover-effect">
        <div className="mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">{t("ticketDetails.rightColumn.ticketInformation")}</h3>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
          </div>
        </div>

        <div className="space-y-5">
          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              {t("ticketDetails.rightColumn.status")}
            </label>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
              >
                <span>{t(`ticketsPage.statuses.${localStatus?.replace(/_/g, ' ') || ""}`)}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
              >
                <li onClick={() => handleStatusChange("New")}>
                  <a className="font-medium hover:bg-purple-400">
                    {t("ticketsPage.statuses.New")}
                  </a>
                </li>
                <li onClick={() => handleStatusChange("Under Process")}>
                  <a className="font-medium hover:bg-blue-400">
                    {t("ticketsPage.statuses.Under Process")}
                  </a>
                </li>
                <li onClick={() => handleStatusChange("Pending Employee")}>
                  <a className="font-medium hover:bg-orange-400">
                    {t("ticketsPage.statuses.Pending Employee")}
                  </a>
                </li>
                <li onClick={() => handleStatusChange("Pending Third Party")}>
                  <a className="font-medium hover:bg-orange-300">
                    {t("ticketsPage.statuses.Pending Third Party")}
                  </a>
                </li>
                <li onClick={() => handleStatusChange("Completed")}>
                  <a className="font-medium hover:bg-green-400">
                    {t("ticketsPage.statuses.Completed")}
                  </a>
                </li>
                <li onClick={() => handleStatusChange("Closed")}>
                  <a className="font-medium hover:bg-gray-400">
                    {t("ticketsPage.statuses.Closed")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Priority Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              {t("ticketDetails.rightColumn.priority")}
            </label>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
              >
                <span>
                  {t(`ticketsPage.priorities.${localPriority}`)}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
              >
                <li onClick={() => handlePriorityChange("Low")}>
                  <a className="font-medium hover:bg-green-400">
                    {t("ticketsPage.priorities.Low")}
                  </a>
                </li>
                <li onClick={() => handlePriorityChange("Medium")}>
                  <a className="font-medium hover:bg-blue-400">
                    {t("ticketsPage.priorities.Medium")}
                  </a>
                </li>
                <li onClick={() => handlePriorityChange("High")}>
                  <a className="font-medium hover:bg-orange-400">
                    {t("ticketsPage.priorities.High")}
                  </a>
                </li>
                <li onClick={() => handlePriorityChange("Critical")}>
                  <a className="font-medium hover:bg-red-500">
                    {t("ticketsPage.priorities.Critical")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("ticketDetails.rightColumn.assignedTo")}
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-md">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div>
                <p>
                  {ticket.assigned_user_name
                    ? t(`employees.${ticket.assigned_user_name}`, {
                        defaultValue: ticket.assigned_user_name,
                      })
                    : t("ticketDetails.rightColumn.unassigned")}
                </p>
                <p className="!text-sm !text-gray-600">
                  {t(`groups.${ticket.assigned_group_name}`, {
                    defaultValue: ticket.assigned_group_name,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover-effect">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">{t("ticketDetails.rightColumn.slaTracking")}</h3>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-blue-100">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              {t("ticketDetails.rightColumn.responseDue")}
            </label>
            <p
              className={`text-gray-600 !text-sm font-semibold !px-2 !py-1${
                ticket.sla_response_breached ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatDateTime(ticket.sla_response_due_at)}
            </p>
            {ticket.sla_response_breached && (
              <div className="mt-2">
                <Tag
                  type="status"
                  value="OVERDUE"
                  t={() => t("ticketDetails.rightColumn.breached")}
                  icon={<AlertTriangle className="w-3 h-3" />}
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-100 to-white rounded-xl border border-purple-100">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              {t("ticketDetails.rightColumn.resolutionDue")}
            </label>
            <p
              className={`text-gray-600 !text-sm font-semibold !px-2 !py-1${
                ticket.sla_resolution_breached
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {formatDateTime(ticket.sla_resolution_due_at)}
            </p>
            {ticket.sla_resolution_breached && (
              <div className="mt-2">
                <Tag
                  type="status"
                  value="OVERDUE"
                  t={() => t("ticketDetails.rightColumn.breached")}
                  icon={<AlertTriangle className="w-3 h-3" />}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover-effect">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">{t("ticketDetails.rightColumn.employeeDetails")}</h3>
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover-effect">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide">
                {t("ticketDetails.rightColumn.name")}
              </p>
              <p className="!truncate !text-sm !font-semibold !text-gray-900">
                {t(`employees.${ticket.employee.name}`, {
                  defaultValue: ticket.employee.name,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover-effect">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide">
                {t("ticketDetails.rightColumn.email")}
              </p>
              <p className="!truncate !text-sm !font-semibold !text-gray-900">
                {ticket.employee.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover-effect">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide">
                {t("ticketDetails.rightColumn.department")}
              </p>
              <p className="!truncate !text-sm !font-semibold !text-gray-900">
                {t(`departments.${ticket.employee.department}`, {
                  defaultValue: ticket.employee.department,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover-effect">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide">
                {t("ticketDetails.rightColumn.position")}
              </p>
              <p className="!truncate !text-sm !font-semibold !text-gray-900">
                {ticket.employee.position}
              </p>
            </div>
          </div>

          {ticket.employee.location && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover-effect">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wide">
                  {t("ticketDetails.rightColumn.location")}
                </p>
                <p className="!truncate !text-sm !font-semibold !text-gray-900">
                  {ticket.employee.location}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

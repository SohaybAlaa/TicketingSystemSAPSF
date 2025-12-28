import {
  CheckCircle2,
  ChevronDown,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";

export default function TicketRightColumnCards({
  ticket,
  localStatus,
  localPriority,
  handleStatusChange,
  handlePriorityChange,
}) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          Ticket Information
        </h3>

        <div className="space-y-5">
          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Status
            </label>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
              >
                <span>{(localStatus || "").replace("_", " ")}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
              >
                <li onClick={() => handleStatusChange("NEW")}>
                  <a className="font-medium hover:bg-purple-400">New</a>
                </li>
                <li onClick={() => handleStatusChange("UNDER_PROCESS")}>
                  <a className="font-medium hover:bg-blue-400">Under Process</a>
                </li>
                <li onClick={() => handleStatusChange("PENDING_EMPLOYEE")}>
                  <a className="font-medium hover:bg-orange-400">
                    Pending with Employee
                  </a>
                </li>
                <li onClick={() => handleStatusChange("PENDING_THIRD_PARTY")}>
                  <a className="font-medium hover:bg-orange-300">
                    Pending with Third Party
                  </a>
                </li>
                <li onClick={() => handleStatusChange("COMPLETED")}>
                  <a className="font-medium hover:bg-green-400">Completed</a>
                </li>
                <li onClick={() => handleStatusChange("CLOSED")}>
                  <a className="font-medium hover:bg-gray-400">Closed</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Priority Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Priority
            </label>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-outline w-full justify-between px-4 py-3 h-auto min-h-0 border-2 border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 font-medium"
              >
                <span>{localPriority || ""}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-full p-2 shadow-xl border border-gray-200 mt-2"
              >
                <li onClick={() => handlePriorityChange("LOW")}>
                  <a className="font-medium hover:bg-green-400">Low</a>
                </li>
                <li onClick={() => handlePriorityChange("MEDIUM")}>
                  <a className="font-medium hover:bg-blue-400">Medium</a>
                </li>
                <li onClick={() => handlePriorityChange("HIGH")}>
                  <a className="font-medium hover:bg-orange-400">High</a>
                </li>
                <li onClick={() => handlePriorityChange("CRITICAL")}>
                  <a className="font-medium hover:bg-red-500">Critical</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Assigned To
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {ticket.assigned_user_name || "Unassigned"}
                </p>
                <p className="text-xs text-gray-600">
                  {ticket.assigned_group_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">SLA Tracking</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-blue-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Response Due
            </label>
            <p
              className={`text-sm font-semibold ${
                ticket.sla_response_breached ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatDateTime(ticket.sla_response_due_at)}
            </p>
            {ticket.sla_response_breached && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Breached
              </span>
            )}
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-100 to-white rounded-xl border border-purple-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Resolution Due
            </label>
            <p
              className={`text-sm font-semibold ${
                ticket.sla_resolution_breached
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {formatDateTime(ticket.sla_resolution_due_at)}
            </p>
            {ticket.sla_resolution_breached && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Breached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-lg hover:scale-103 transition-all duration-300">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Employee Details</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {ticket.employee.name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {ticket.employee.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Department
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {ticket.employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Position
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {ticket.employee.position}
              </p>
            </div>
          </div>

          {ticket.employee.location && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm font-semibold text-gray-900">
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

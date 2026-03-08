import { useTranslation } from "react-i18next";
import { Calendar, UserCog, User, ArrowRightFromLine, ArrowLeftFromLine } from "lucide-react";
import { formatDateTime } from "@utils/formatDateTime";
import Tag, { getValueColor, getValueIcon } from "@components/ui/Tag";

const activityConfig = {
  status: {
    dotBg: "from-blue-500 to-blue-600",
    label: "ticketDetails.details.statusChanged",
  },
  priority: {
    dotBg: "from-orange-500 to-orange-600",
    label: "ticketDetails.details.priorityChanged",
  },
  assignment: {
    icon: UserCog,
    dotBg: "from-yellow-400 to-yellow-500",
    label: "ticketDetails.details.assignmentChanged",
  },
};

export default function DetailsTab({ ticket, statusHistory }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const renderActivityValue = (history) => {
    const { change_type, old_value, new_value } = history;
    const newColor = change_type === "assignment" ? "#eab308" : getValueColor(new_value);
    const oldColor = old_value ? (change_type === "assignment" ? "#eab308" : getValueColor(old_value)) : null;
    const OldIcon = old_value && change_type !== "assignment" ? getValueIcon(old_value) : null;
    const NewIcon = change_type !== "assignment" ? getValueIcon(new_value) : null;

    const getTranslatedValue = (type, val) => {
      if (type === "status") return t(`ticketsPage.statuses.${val}`, { defaultValue: val });
      if (type === "priority") return t(`ticketsPage.priorities.${val}`, { defaultValue: val });
      return t(`employees.${val}`, { defaultValue: val });
    };

    if (change_type === "assignment") {
      return (
        <span className="!text-sm !font-semibold inline-flex items-center gap-2">
          {old_value && (
            <>
              <span style={{ color: oldColor }}>{getTranslatedValue(change_type, old_value)}</span>
              {isRTL
                ? <ArrowLeftFromLine className="w-4 h-4 text-gray-500" />
                : <ArrowRightFromLine className="w-4 h-4 text-gray-500" />
              }
            </>
          )}
          <span style={{ color: newColor }}>{getTranslatedValue(change_type, new_value)}</span>
        </span>
      );
    }

    return (
      <span className="!text-sm !font-semibold inline-flex items-center gap-2">
        {old_value && (
          <>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border"
              style={{ backgroundColor: `${oldColor}15`, borderColor: `${oldColor}30`, color: oldColor }}
            >
              {OldIcon && <OldIcon className="w-3.5 h-3.5" />}
              {getTranslatedValue(change_type, old_value)}
            </span>
            {isRTL
              ? <ArrowLeftFromLine className="w-4 h-4 text-gray-500" />
              : <ArrowRightFromLine className="w-4 h-4 text-gray-500" />
            }
          </>
        )}
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border"
          style={{ backgroundColor: `${newColor}15`, borderColor: `${newColor}30`, color: newColor }}
        >
          {NewIcon && <NewIcon className="w-3.5 h-3.5" />}
          {getTranslatedValue(change_type, new_value)}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-3">
          {t("ticketDetails.details.description")}
        </label>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 rounded-xl blur"></div>
          <p className="relative text-gray-800 bg-white p-5 rounded-xl border border-gray-200 shadow-sm leading-relaxed">
            {ticket.reason}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100 hover-effect">
          <label className="block text-md font-semibold text-gray-700 mb-2">
            {t("ticketDetails.details.category")}
          </label>
          <p className="!text-gray-900 !font-medium">
            {t(`categories.${ticket.category_name}`, {
              defaultValue: ticket.category_name,
            })}
          </p>
          {ticket.subcategory_name && (
            <p className="!text-sm !text-gray-600 mt-1">
              {t(`subcategories.${ticket.subcategory_name}`, {
                defaultValue: ticket.subcategory_name,
              })}
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-white p-5 rounded-xl border border-yellow-100 hover-effect">
          <label className="block text-md font-semibold text-gray-700 mb-2">
            {t("ticketDetails.details.channel")}
          </label>
          <p className="!text-gray-900 !font-medium">{ticket.employee.email}</p>
        </div>
      </div>

      {statusHistory.length > 0 && (() => {
        const initialEntries = statusHistory.filter(h => !h.old_value);
        const changeEntries = statusHistory.filter(h => h.old_value);
        return (
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              {t("ticketDetails.details.activityLog")}
            </label>

            <div className={`relative space-y-4 ${isRTL ? 'pr-6' : 'pl-6'} before:absolute ${isRTL ? 'before:right-[6.5px]' : 'before:left-[6.5px]'} before:top-0 before:bottom-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-yellow-100 before:to-orange-500`}>
              {/* Initial ticket created entry */}
              {initialEntries.length > 0 && (
                <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm shadow-yellow-400/50">
                  <div className={`absolute ${isRTL ? '-right-6' : '-left-6'} top-5 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-md`}></div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="!text-sm !font-bold !text-gray-700 mb-1">{t("ticketDetails.details.ticketCreated")}</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          initialEntries[0].changed_by_type === 'employee'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                            : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                        }`}>
                          {initialEntries[0].changed_by_type === 'employee'
                            ? <User className="w-3 h-3 text-white" />
                            : <UserCog className="w-3 h-3 text-white" />
                          }
                        </div>
                        <span className="!text-xs !font-semibold !text-gray-600">
                          {initialEntries[0].changed_by_name}
                          {initialEntries[0].changed_by_department && (
                            <span className="!text-gray-400"> • {initialEntries[0].changed_by_department}</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 !bg-gray-100 !text-xs !text-gray-700 !font-bold !px-3 !py-1.5 !rounded-lg">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(initialEntries[0].changed_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {initialEntries.map((entry) => {
                      if (entry.change_type === "assignment") {
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                            style={{
                              backgroundColor: "#eab30815",
                              borderColor: "#eab30830",
                            }}
                          >
                            <UserCog className="w-4 h-4" style={{ color: "#eab308" }} />
                            <span className="!text-xs !font-semibold !text-gray-500">{t("ticketDetails.details.assignmentChanged")}:</span>
                            <span className="!text-sm !font-bold" style={{ color: "#eab308" }}>{entry.new_value}</span>
                          </div>
                        );
                      }
                      const color = getValueColor(entry.new_value);
                      const ValIcon = getValueIcon(entry.new_value);
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                          style={{
                            backgroundColor: `${color}15`,
                            borderColor: `${color}30`,
                          }}
                        >
                          <span className="!text-xs !font-semibold !text-gray-500">{t(`ticketDetails.details.${entry.change_type}Changed`)}:</span>
                          {ValIcon && <ValIcon className="w-4 h-4" style={{ color }} />}
                          <span className="!text-sm !font-bold" style={{ color }}>{t(entry.change_type === "status" ? `ticketsPage.statuses.${entry.new_value}` : `ticketsPage.priorities.${entry.new_value}`, { defaultValue: entry.new_value })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subsequent changes */}
              {changeEntries.map((history) => {
                const config = activityConfig[history.change_type] || activityConfig.status;
                return (
                  <div
                    key={history.id}
                    className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm shadow-yellow-400/50"
                  >
                    <div className={`absolute ${isRTL ? '-right-6' : '-left-6'} top-5 w-4 h-4 bg-gradient-to-br ${
                      history.changed_by_type === 'employee'
                        ? 'from-blue-400 to-blue-500'
                        : 'from-yellow-400 to-orange-400'
                    } rounded-full border-2 border-white shadow-md`}></div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          history.changed_by_type === 'employee'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                            : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                        }`}>
                          {history.changed_by_type === 'employee'
                            ? <User className="w-3 h-3 text-white" />
                            : <UserCog className="w-3 h-3 text-white" />
                          }
                        </div>
                        <span className="!text-xs !font-semibold !text-gray-600">
                          {t(`employees.${history.changed_by_name}`, {
                            defaultValue: history.changed_by_name,
                          })}
                          {history.changed_by_department && (
                            <span className="!text-gray-400"> • {history.changed_by_department}</span>
                          )}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 !bg-gray-100 !text-xs !text-gray-700 !font-bold !px-3 !py-1.5 !rounded-lg">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(history.changed_at)}
                      </span>
                    </div>
                    <div className="mt-1">
                      {renderActivityValue(history)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

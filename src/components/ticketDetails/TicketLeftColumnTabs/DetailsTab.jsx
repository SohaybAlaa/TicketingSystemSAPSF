import { useTranslation } from "react-i18next";
import { formatDateTime } from "@utils/formatDateTime";

export default function DetailsTab({ ticket, statusHistory }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-3">
          {t("ticketDetails.details.description")}
        </label>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 rounded-xl blur"></div>
          <p className="relative text-gray-800 bg-white p-5 rounded-xl border border-gray-200 shadow-sm leading-relaxed">
            {/* Check if description is a translation key */}
            {ticket.description === "ticketDetails.genericDescription"
              ? t(ticket.description, ticket.descriptionParams || {})
              : ticket.description}
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
          <p className="!text-gray-900 !font-medium">{ticket.channel}</p>
        </div>
      </div>

      {statusHistory.length > 0 && (
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            {t("ticketDetails.details.statusHistory")}
          </label>
          <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-orange-400 before:to-yellow-300">
            {statusHistory.map((history) => (
              <div
                key={history.id}
                className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm shadow-yellow-400/50"
              >
                <div className="absolute -left-6 top-5 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-md"></div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>
                      {history.old_status && (
                        <span>
                          {t(`ticketDetails.statuses.${history.old_status}`)} →{" "}
                        </span>
                      )}
                      <span>
                        {t(`ticketDetails.statuses.${history.new_status}`)}
                      </span>
                    </span>
                  </div>
                  <span className="!bg-gray-100 text-gray-600 font-semibold !px-2 !py-1 !rounded-full">
                    {formatDateTime(history.changed_at)}
                  </span>
                </div>
                <p className="!text-xs !text-gray-600 !mb-1">
                  {t("ticketDetails.details.changedBy")}{" "}
                  {t(`employees.${history.changed_by_name}`, {
                    defaultValue: history.changed_by_name,
                  })}
                </p>
                {history.comment && (
                  <p className="!text-sm !text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    {history.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

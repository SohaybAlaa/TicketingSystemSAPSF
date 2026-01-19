import React from "react";

/**
 * TicketsCountDisplay - A component for displaying the count of tickets
 * 
 * @param {Object} props
 * @param {string} props.quickFilterText - Current search/filter text
 * @param {number} props.displayedRowCount - Number of currently displayed rows after filtering
 * @param {number} props.totalTickets - Total number of tickets before filtering
 * @param {boolean} props.isRTL - Whether to use RTL layout
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
const TicketsCountDisplay = ({ 
  quickFilterText, 
  displayedRowCount, 
  totalTickets, 
  isRTL, 
  t 
}) => {
  return (
    <div className="mb-4">
      <p className={`text-gray-600 text-sm ${isRTL ? "mr-3" : "ml-3"}`}>
        {quickFilterText ? (
          <>
            {t("ticketsPage.showing")} {displayedRowCount}{" "}
            {t("ticketsPage.of")} {totalTickets}{" "}
            {totalTickets !== 1
              ? t("ticketsPage.tickets")
              : t("ticketsPage.ticket")}
          </>
        ) : (
          <>
            {t("ticketsPage.showing")} {totalTickets}{" "}
            {t("ticketsPage.tickets")}
          </>
        )}
      </p>
    </div>
  );
};

export default TicketsCountDisplay;

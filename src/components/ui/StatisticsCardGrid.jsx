import React from "react";

/**
 * StatisticsCardGrid - A container component for statistics cards
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The cards to display in the grid
 * @returns {JSX.Element}
 */
const StatisticsCardGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {children}
    </div>
  );
};

export default StatisticsCardGrid;

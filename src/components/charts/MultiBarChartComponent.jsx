import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * MultiBarChartComponent - A reusable bar chart component for displaying multiple data series
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with data for the chart
 * @param {boolean} props.isRTL - Whether the chart should be displayed in RTL mode
 * @param {string} props.title - Optional title for the chart
 * @param {string} props.xDataKey - The key to use for the X-axis data
 * @param {Array} props.bars - Array of bar configurations [{dataKey, fill, name}]
 * @param {number} props.height - Optional height for the chart (default: 300)
 * @returns {JSX.Element}
 */
const MultiBarChartComponent = ({ 
  data, 
  isRTL, 
  title, 
  xDataKey, 
  bars,
  height = 300 
}) => {
  // Chart styling configuration
  const chartTextStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "normal",
    fontSize: isRTL ? "14px" : "12px",
  };

  const tooltipStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "normal",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && <h2 className="mb-4">{title}</h2>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xDataKey} 
            style={chartTextStyle} 
            reversed={isRTL} 
          />
          <YAxis style={chartTextStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={tooltipStyle} />
          {bars.map((bar, index) => (
            <Bar
              key={`bar-${index}`}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiBarChartComponent;

import React from "react";
import {
  PieChart as RechartsPC,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getColorForIndex } from "@utils/helpers";
import { getValueColor } from "@ui/Tag";

/**
 * PieChartComponent - A reusable pie chart component for displaying status data
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with name and value properties
 * @param {boolean} props.isRTL - Whether the chart should be displayed in RTL mode
 * @param {string} props.title - Optional title for the chart
 * @param {number} props.height - Optional height for the chart (default: 300)
 * @param {boolean} props.useStatusColors - Whether to use status colors from Tag component
 * @param {Array} props.originalNames - Optional array of original (untranslated) names for color lookup
 * @returns {JSX.Element}
 */
const PieChartComponent = ({ data, isRTL, title, height = 300, useStatusColors = false, originalNames = [] }) => {
  // Chart styling configuration
  const tooltipStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "normal",
  };

  // Custom label renderer for pie chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const labelText = isRTL
      ? `${name} %${(percent * 100).toFixed(0)}`
      : `${name} ${(percent * 100).toFixed(0)}%`;
    
    // Use original name for color lookup if available, otherwise use the displayed name
    const colorLookupName = useStatusColors && originalNames[index] ? originalNames[index] : name;
    const sliceColor = useStatusColors ? getValueColor(colorLookupName) : getColorForIndex(index);
    const textAnchor = isRTL
      ? x > cx
        ? "end"
        : "start"
      : x > cx
      ? "start"
      : "end";

    return (
      <text
        x={x}
        y={y}
        fill={sliceColor}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{
          fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
          fontWeight: isRTL ? "bold" : "700",
          fontSize: isRTL ? "16px" : "14px",
        }}
      >
        {labelText}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2"></div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPC>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={useStatusColors ? getValueColor(useStatusColors && originalNames[index] ? originalNames[index] : entry.name) : getColorForIndex(index)}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            wrapperStyle={{ outline: "none" }}
          />
        </RechartsPC>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;

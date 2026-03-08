import React from "react";
import { getValueColor } from "@ui/Tag";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

/**
 * BarChartComponent - A reusable bar chart component for displaying data
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with data for the chart
 * @param {boolean} props.isRTL - Whether the chart should be displayed in RTL mode
 * @param {string} props.title - Optional title for the chart
 * @param {string} props.xDataKey - The key to use for the X-axis data
 * @param {string} props.yDataKey - The key to use for the Y-axis data (bar height)
 * @param {string} props.barColor - Color for the bars (default: #3b82f6 - blue)
 * @param {number} props.height - Optional height for the chart (default: 300)
 * @returns {JSX.Element}
 */
const BarChartComponent = ({ 
  data, 
  isRTL, 
  title, 
  xDataKey, 
  yDataKey, 
  barColor = "#eab308", 
  height = 340,
  originalNames = []
}) => {
  // Chart styling configuration
  const chartTextStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: "700",
    fontSize: isRTL ? "14px" : "13px",
    fill: "#374151",
  };

  const yAxisStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: "600",
    fontSize: "13px",
    fill: "#6b7280",
  };

  const tooltipStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: isRTL ? "bold" : "500",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white rounded-xl border border-gray-100 shadow-xl px-4 py-3"
          style={{ minWidth: 140 }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {payload[0].payload[xDataKey]}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: barColor }}
            />
            <span
              className="text-lg font-extrabold"
              style={{ color: barColor }}
            >
              {payload[0].value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const gradientId = `barGradient-${yDataKey}`;
  const shadowId = `barShadow-${yDataKey}`;

  const CustomXAxisTick = ({ x, y, payload, index }) => {
    const origName = originalNames[index];
    const color = origName ? getValueColor(origName) : "#374151";
    return (
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fill={color}
        style={{
          fontWeight: "800",
          fontSize: isRTL ? "14px" : "13px",
          fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
          letterSpacing: "0.05em",
        }}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2"></div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data}
          margin={{ top: 30, right: 30, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barColor} stopOpacity={1} />
              <stop offset="60%" stopColor={barColor} stopOpacity={0.7} />
              <stop offset="100%" stopColor={barColor} stopOpacity={0.2} />
            </linearGradient>
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={barColor} floodOpacity="0.25" />
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis 
            dataKey={xDataKey} 
            reversed={isRTL}
            axisLine={false}
            tickLine={false}
            tick={originalNames.length > 0 ? <CustomXAxisTick /> : { style: chartTextStyle }}
          />
          <YAxis 
            style={yAxisStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: `${barColor}18`, rx: 8 }}
          />
          <Bar
            dataKey={yDataKey}
            fill={`url(#${gradientId})`}
            radius={[10, 10, 0, 0]}
            filter={`url(#${shadowId})`}
            maxBarSize={56}
            label={{
              position: "top",
              style: { 
                fontWeight: "900",
                fontSize: "15px",
                fill: barColor,
                fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
              },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;

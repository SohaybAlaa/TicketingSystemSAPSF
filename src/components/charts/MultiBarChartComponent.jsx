import React from "react";
import { getValueColor } from "@ui/Tag";
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
  height = 360,
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

  const barColorMap = bars.reduce((acc, bar) => {
    acc[bar.dataKey] = bar.fill;
    return acc;
  }, {});

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white rounded-xl border border-gray-100 shadow-xl px-4 py-3"
          style={{ minWidth: 150 }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {payload[0].payload[xDataKey]}
          </p>
          {payload.map((entry, index) => {
            const color = barColorMap[entry.dataKey] || "#6b7280";
            return (
              <div key={index} className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-gray-500">{entry.name}:</span>
                <span
                  className="text-base font-extrabold"
                  style={{ color }}
                >
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const legendStyle = {
    fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
    fontWeight: "700",
    fontSize: "13px",
    color: "#374151",
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
          margin={{ top: 36, right: 30, left: 0, bottom: 8 }}
        >
          <defs>
            {bars.map((bar, index) => (
              <React.Fragment key={`defs-${index}`}>
                <linearGradient id={`multiBarGradient-${bar.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="70%" stopColor={bar.fill} stopOpacity={1} />
                  <stop offset="85%" stopColor={bar.fill} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={bar.fill} stopOpacity={0.2} />
                </linearGradient>
                <filter id={`multiBarShadow-${bar.dataKey}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={bar.fill} floodOpacity="0.25" />
                </filter>
              </React.Fragment>
            ))}
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
            cursor={{ fill: "rgba(107,114,128,0.08)", rx: 8 }}
          />
          <Legend 
            wrapperStyle={legendStyle}
            verticalAlign="bottom"
            height={36}
          />
          {bars.map((bar, index) => (
            <Bar
              key={`bar-${index}`}
              dataKey={bar.dataKey}
              fill={`url(#multiBarGradient-${bar.dataKey})`}
              name={bar.name}
              radius={[10, 10, 0, 0]}
              filter={`url(#multiBarShadow-${bar.dataKey})`}
              maxBarSize={48}
              label={{
                position: "top",
                style: {
                  fontWeight: "900",
                  fontSize: "15px",
                  fill: barColorMap[bar.dataKey] || bar.fill,
                  fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
                },
              }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiBarChartComponent;

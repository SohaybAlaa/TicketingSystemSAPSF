import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * normalizeTrend — ensures the sparkline always has valid data to render.
 */
function normalizeTrend(trend, value) {
  if (Array.isArray(trend) && trend.length >= 2) return trend;
  const v = typeof value === "number" ? value : 0;
  return [v, v, v, v, v, v, v];
}

/**
 * Sparkline — animated SVG mini-chart.
 * Animation only plays while `isHovered` is true; pauses otherwise.
 *
 * @param {Object}  props
 * @param {number[]} props.data       - Array of numeric values to plot (≥ 2 items)
 * @param {string}   props.color      - Stroke & fill colour
 * @param {string}   props.id         - Unique identifier for scoping CSS keyframes
 * @param {boolean}  props.isHovered  - Controls play/pause of animations
 */
function Sparkline({ data, color = "#a5b4fc", id, isHovered }) {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(null);

  const w = 125, h = 40, pad = 3;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const isFlat = range === 0;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: isFlat ? h / 2 : pad + (1 - (v - min) / range) * (h - pad * 2),
  }));

  const smoothPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaPath = `${smoothPath} L ${points[points.length - 1].x},${h} L ${points[0].x},${h} Z`;

  const gradId = `spark-${id}`;

  useEffect(() => {
    if (pathRef.current) {
      const L = pathRef.current.getTotalLength();
      setPathLength(L > 1 ? L : w - pad * 2);
    }
  }, [smoothPath]);

  const ready = pathLength !== null && pathLength > 0;

  const animKeyframes = ready ? `
    @keyframes drawLine-${id} {
      0%   { stroke-dashoffset: ${pathLength}; }
      60%  { stroke-dashoffset: 0; }
      85%  { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: ${pathLength}; }
    }
    @keyframes fadeArea-${id} {
      0%   { opacity: 0; }
      40%  { opacity: 0; }
      65%  { opacity: 0.7; }
      85%  { opacity: 0.7; }
      100% { opacity: 0; }
    }
    @keyframes dotPop-${id} {
      0%   { opacity: 0; r: 0; }
      58%  { opacity: 0; r: 0; }
      68%  { opacity: 1; r: 3.5; }
      75%  { opacity: 1; r: 2.5; }
      85%  { opacity: 1; r: 2.5; }
      100% { opacity: 0; r: 0; }
    }
  ` : "";

  return (
    <>
      {ready && <style>{animKeyframes}</style>}

      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" overflow="visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill — always visible at rest (opacity 0.7), animates on hover */}
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          style={ready ? {
            opacity: isHovered ? undefined : 0.7,
            animation: isHovered
              ? `fadeArea-${id} 2.6s cubic-bezier(0.4,0,0.2,1) infinite`
              : "none",
          } : { opacity: 0 }}
        />

        {/* Line — fully drawn at rest, re-animates draw sequence on hover */}
        <path
          ref={pathRef}
          d={smoothPath}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={ready ? {
            strokeDasharray: pathLength,
            strokeDashoffset: isHovered ? undefined : 0, // 0 = fully drawn at rest
            animation: isHovered
              ? `drawLine-${id} 2.6s cubic-bezier(0.4,0,0.2,1) infinite`
              : "none",
          } : { opacity: 0 }}
        />

        {/* Terminal dot — visible at rest, animates on hover */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={color}
          style={ready ? {
            opacity: isHovered ? undefined : 1,
            animation: isHovered
              ? `dotPop-${id} 2.6s cubic-bezier(0.4,0,0.2,1) infinite`
              : "none",
          } : { opacity: 0 }}
        />
      </svg>
    </>
  );
}

/**
 * calcPctChange — computes the percentage change from first to last trend value.
 */
function calcPctChange(trend) {
  if (!trend || trend.length < 2) return null;
  const prev = trend[0];
  const curr = trend[trend.length - 1];
  return prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
}

/**
 * StatCard — Dashboard statistic card with sparkline trend and % change badge.
 * Sparkline animation plays only while the card is hovered.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBoxColor = "#6366f1",
  hoverShadow = "rgba(59,130,246,0.3)",
  alert = false,
  trend,
  sparkColor = "#a5b4fc",
  animationType = "spin",
  onClick,
}) {
  const { i18n, t } = useTranslation();

  // Track card hover state in React — drives Sparkline play/pause
  const [isHovered, setIsHovered] = useState(false);

  const isRTL = i18n.language === "ar" || document.documentElement.dir === "rtl";

  const sparkId = title?.replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "").toLowerCase()
    || Math.random().toString(36).slice(2);

  const safeTrend = normalizeTrend(trend, typeof value === "number" ? value : 0);

  const pct = calcPctChange(trend);
  const isUp   = pct !== null && pct >= 0;
  const isGood = alert ? !isUp : isUp;

  // ─── Hover handlers ──────────────────────────────────────────────────────────

  const handleMouseEnter = (e) => {
    setIsHovered(true);

    e.currentTarget.style.boxShadow = `0 10px 30px ${hoverShadow}`;
    e.currentTarget.style.borderColor = `${iconBoxColor}55`;

    const iconBox = e.currentTarget.querySelector('.icon-box');
    if (iconBox) iconBox.style.border = `2.5px solid ${iconBoxColor}99`;

    const icon = e.currentTarget.querySelector('.card-icon');
    if (icon) {
      if (animationType === 'flip') {
        icon.style.animation = 'none';
        icon.style.transition = 'transform 1s ease';
        icon.style.transform = 'rotateY(360deg)';
      } else {
        icon.style.transition = 'none';
        icon.style.animation = 'spin 0.8s linear infinite';
      }
    }
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);

    e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)";
    e.currentTarget.style.borderColor = "";

    const iconBox = e.currentTarget.querySelector('.icon-box');
    if (iconBox) iconBox.style.border = `1.5px solid ${iconBoxColor}40`;

    const icon = e.currentTarget.querySelector('.card-icon');
    if (icon) {
      icon.style.animation = 'none';
      icon.style.transition = 'none';
      icon.style.transform = 'rotate(0deg)';
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 border-gray-100"
      style={{
        background: isRTL
          ? `linear-gradient(225deg, ${iconBoxColor}30 0%, ${iconBoxColor}10 40%, #ffffff 100%)`
          : `linear-gradient(135deg, ${iconBoxColor}30 0%, ${iconBoxColor}10 40%, #ffffff 100%)`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Sparkline — top-right in LTR, mirrored to top-left in RTL */}
      <div
        className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}
        style={isRTL ? { transform: "scaleX(-1)" } : undefined}
      >
        <Sparkline data={safeTrend} color={sparkColor} id={sparkId} isHovered={isHovered} />
      </div>

      {/* Card body */}
      <div className="flex items-center gap-4">

        <div
          className="icon-box flex-shrink-0 p-3.5 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${iconBoxColor}20`, border: `1.5px solid ${iconBoxColor}40` }}
        >
          <Icon className="card-icon w-8 h-8" style={{ color: iconBoxColor }} />
        </div>

        <div className={`min-w-0 flex-1 ${isRTL ? "text-right" : "text-left"}`}>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">
            {title}
          </p>

          <p className={`!text-3xl !font-extrabold !leading-none ${alert && value > 0 ? "!text-red-500" : "!text-slate-800"}`}>
            {value}
          </p>

          {pct !== null && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[11px] font-black ${isGood ? "text-green-500" : "text-red-400"}`}>
                {isUp ? "↑" : "↓"} {Math.abs(pct)}%
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {t("dashboard.recentActivity.vsLastWeek")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 */
export default function Modal({ isOpen, onClose, title, children, icon, subtitle, maxWidth }) {
  if (!isOpen) return null;

  // Check if this is a delete modal by examining the icon content
  const isDeleteModal = icon && icon.props && icon.props.children && 
    (icon.props.children.props?.color === "#7f1d1d" || 
     icon.props.children?.props?.color === "#7f1d1d");

  const headerGradient = isDeleteModal 
    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 40%, white 100%)"
    : "linear-gradient(135deg, rgba(253, 199, 0, 0.3) 0%, rgba(253, 199, 0, 0.1) 40%, white 100%)";

  const accentBarGradient = isDeleteModal
    ? "linear-gradient(to bottom, #ef4444, #dc2626)"
    : "linear-gradient(to bottom, #facc15, #f59e0b)";

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "90%",
          maxWidth: maxWidth || "500px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: headerGradient,
            borderBottom: "1px solid #e5e7eb",
            position: "relative",
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "101.3%",
              background: accentBarGradient,
              borderTopLeftRadius: "12px",
              borderBottomLeftRadius: "12px",
            }}
          />
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
            }}
          >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#6b7280",
                    margin: "4px 0 0 0",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

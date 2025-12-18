import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
} from "lucide-react";
import { getAlertStyles } from "../../utils/helpers";

/**
 * Global Alert Notification Component
 * @param {object} alert - Alert object with type, message, and optional title
 * @param {function} onClose - Callback to close the alert
 */
export default function AlertNotification({ alert, onClose }) {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert) return null;

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = getAlertStyles(alert.type);
  const Icon = iconMap[alert.type] || Info;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 100000,
        minWidth: "320px",
        maxWidth: "500px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(400px);
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: styles.bg,
          border: `2px solid ${styles.border}`,
          borderRadius: "12px",
          padding: "16px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <Icon size={24} color={styles.text} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          {alert.title && (
            <h4
              style={{
                margin: 0,
                marginBottom: "4px",
                fontSize: "16px",
                fontWeight: "600",
                color: styles.text,
              }}
            >
              {alert.title}
            </h4>
          )}
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: styles.text,
              lineHeight: "1.5",
            }}
          >
            {alert.message}
          </p>
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
            borderRadius: "4px",
            transition: "background-color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={18} color={styles.text} />
        </button>
      </div>
    </div>,
    document.body
  );
}

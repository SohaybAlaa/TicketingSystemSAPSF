import React from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Individual Alert Component with DaisyUI styling
 * @param {string} id - Unique identifier for the alert
 * @param {string} type - Alert type (success, error, info, warning)
 * @param {string} message - Alert message
 * @param {string} title - Optional alert title
 * @param {function} onClose - Callback to close the alert
 */
const Alert = ({ id, type, message, title, onClose }) => {
  const alertTypes = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
    warning: "alert-warning",
  };

  const icons = {
    success: <CheckCircle className="h-6 w-6 shrink-0 stroke-current" />,
    error: <AlertCircle className="h-6 w-6 shrink-0 stroke-current" />,
    info: <AlertCircle className="h-6 w-6 shrink-0 stroke-current" />,
    warning: <AlertCircle className="h-6 w-6 shrink-0 stroke-current" />,
  };

  return (
    <div
      role="alert"
      className={`alert ${alertTypes[type]} shadow-lg mb-3 animate-slide-in flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        {icons[type]}
        <div>
          {title && <div className="font-bold">{title}</div>}
          <span className={title ? "text-sm" : ""}>{message}</span>
        </div>
      </div>
      <button
        onClick={() => onClose(id)}
        className="btn btn-sm btn-circle btn-ghost hover:bg-black/10"
        type="button"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Alert Notification Component with DaisyUI styling
 * Manages and displays multiple stacked alerts
 * Used in Tickets page
 * @param {Array} alerts - Array of alert objects with id, type, message, and optional title
 * @param {function} onClose - Callback to close a specific alert by id
 */
export default function AlertNotification({ alerts, onClose }) {
  if (!alerts || alerts.length === 0) return null;

  return createPortal(
    <>
      <style>
        {`
          @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in { 
            animation: slide-in 0.3s ease-out; 
          }
        `}
      </style>
      <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
        {alerts.map((alert) => (
          <Alert key={alert.id} {...alert} onClose={onClose} />
        ))}
      </div>
    </>,
    document.body
  );
}

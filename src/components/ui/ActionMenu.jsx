import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Users, SquarePen, Trash2 } from "lucide-react";

/**
 * Action Menu Component - Dropdown menu for ticket actions
 * @param {boolean} isOpen - Controls menu visibility
 * @param {function} onClose - Callback when menu should close
 * @param {object} position - Position object with top and left coordinates
 * @param {function} onAction - Callback when an action is selected
 * @param {string} ticketId - ID of ticket the actions apply to
 */
export default function ActionMenu({ isOpen, onClose, position, onAction, ticketId }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: User, label: "Assign to Me", action: "assignToMe" },
    { icon: Users, label: "Assign to Other", action: "assignToOther" },
    { icon: SquarePen, label: "Change Status", action: "changeStatus" },
    { icon: SquarePen, label: "Change Priority", action: "changePriority" },
    { icon: Trash2, label: "Delete", action: "delete", danger: true },
  ];

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        minWidth: "180px",
        padding: "4px",
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onAction(item.action, ticketId);
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px 12px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "14px",
            color: item.danger ? "#dc2626" : "#374151",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = item.danger
              ? "#fee2e2"
              : "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

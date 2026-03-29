import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { UserPlus, UserCog } from "lucide-react";

const USER_TYPES = ["Agent", "Manager", "Supervisor"];

/**
 * Member Form Modal — Add & Edit Group Members
 * @param {boolean}     isOpen   - Controls modal visibility
 * @param {function}    onClose  - Callback when modal should close
 * @param {function}    onSave   - Callback with form data when saved
 * @param {object|null} initial  - Existing member data for edit mode (null = add)
 * @param {string}      groupName - Name of the parent group (shown in subtitle)
 */
export default function MemberFormModal({ isOpen, onClose, onSave, initial = null, groupName }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isEdit = !!initial;

  const emptyForm = {
    employeeId: "",
    name:       "",
    userType:   "Agent",
    from:       "",
    to:         "",
  };

  const [form,   setForm]   = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              employeeId: initial.employeeId ?? "",
              name:       initial.name       ?? "",
              userType:   initial.userType   ?? "Agent",
              from:       initial.from       ?? "",
              to:         initial.to         ?? "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [isOpen, initial]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    
    const trimmedEmployeeId = form.employeeId.toString().trim();
    const trimmedName = form.name.trim();
    
    if (!trimmedEmployeeId) {
      next.employeeId = t("modals.memberForm.errors.employeeIdRequired", "Employee ID is required");
    } else if (!/^[A-Z0-9-]+$/i.test(trimmedEmployeeId)) {
      next.employeeId = t("modals.memberForm.errors.employeeIdInvalid", "Employee ID must contain only letters, numbers, and hyphens");
    } else if (trimmedEmployeeId.length > 20) {
      next.employeeId = t("modals.memberForm.errors.employeeIdTooLong", "Employee ID must not exceed 20 characters");
    }
    
    if (!trimmedName) {
      next.name = t("modals.memberForm.errors.nameRequired", "Employee name is required");
    } else if (trimmedName.length < 2) {
      next.name = t("modals.memberForm.errors.nameTooShort", "Name must be at least 2 characters");
    } else if (trimmedName.length > 100) {
      next.name = t("modals.memberForm.errors.nameTooLong", "Name must not exceed 100 characters");
    }
    
    if (form.from && form.to && form.from > form.to) {
      next.to = t("modals.memberForm.errors.dateOrder", "'To' date must be after 'From' date");
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  // Shared styles
  const inputStyle = (hasError) => ({
    width: "100%",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: "10px",
    padding: "9px 12px",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    background: "white",
    appearance: "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "5px",
    textAlign: isRTL ? "right" : "left",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const errorStyle = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
    textAlign: isRTL ? "right" : "left",
  };

  const focusHandlers = (errorKey) => ({
    onFocus: (e) => {
      e.target.style.borderColor = "#fbbf24";
      e.target.style.boxShadow   = "0 0 0 3px rgba(251,191,36,0.15)";
    },
    onBlur: (e) => {
      e.target.style.borderColor = errors[errorKey] ? "#ef4444" : "#e5e7eb";
      e.target.style.boxShadow   = "none";
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t("modals.memberForm.editTitle", "Edit Member")
          : t("modals.memberForm.addTitle",  "Add Member")
      }
      icon={
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "linear-gradient(to bottom right, #fde047, #facc15)",
            boxShadow: "0 4px 6px -1px rgba(251, 191, 36, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isEdit
            ? <UserCog  size={26} color="#9d6806" />
            : <UserPlus size={26} color="#9d6806" />
          }
        </div>
      }
      subtitle={
        groupName
          ? isEdit
            ? t("modals.memberForm.editSubtitle", "Update member details in {{group}}", { group: groupName })
            : t("modals.memberForm.addSubtitle",  "Assign a new member to {{group}}",   { group: groupName })
          : undefined
      }
    >
      <div dir={isRTL ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Employee ID + User Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>
              {t("modals.memberForm.employeeId", "Employee ID")}
              <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
            </label>
            <input
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              placeholder="e.g. 12345"
              style={inputStyle(!!errors.employeeId)}
              {...focusHandlers("employeeId")}
            />
            {errors.employeeId && <p style={errorStyle}>{errors.employeeId}</p>}
          </div>

          <div>
            <label style={labelStyle}>{t("modals.memberForm.userType", "User Type")}</label>
            <select
              value={form.userType}
              onChange={(e) => set("userType", e.target.value)}
              style={{ ...inputStyle(false), cursor: "pointer" }}
              {...focusHandlers("userType")}
            >
              {USER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`modals.memberForm.userTypes.${type}`, type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Name */}
        <div>
          <label style={labelStyle}>
            {t("modals.memberForm.name", "Employee Name")}
            <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("modals.memberForm.namePlaceholder", "Full name")}
            style={inputStyle(!!errors.name)}
            {...focusHandlers("name")}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        {/* Valid From / To */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>{t("modals.memberForm.from", "Valid From")}</label>
            <input
              type="date"
              value={form.from}
              onChange={(e) => set("from", e.target.value)}
              style={inputStyle(false)}
              {...focusHandlers("from")}
            />
          </div>
          <div>
            <label style={labelStyle}>{t("modals.memberForm.to", "Valid To")}</label>
            <input
              type="date"
              value={form.to}
              onChange={(e) => set("to", e.target.value)}
              style={inputStyle(!!errors.to)}
              {...focusHandlers("to")}
            />
            {errors.to && <p style={errorStyle}>{errors.to}</p>}
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "8px",
            flexDirection: isRTL ? "row-reverse" : "row",
          }}
        >
          <button onClick={onClose} className="modal-cancel-button">
            {t("modals.memberForm.cancel", "Cancel")}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit
              ? t("modals.memberForm.saveChanges", "Save Changes")
              : t("modals.memberForm.add",          "Add Member")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

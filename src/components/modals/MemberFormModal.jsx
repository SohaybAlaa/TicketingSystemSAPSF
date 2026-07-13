import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { UserPlus, UserCog } from "lucide-react";
import DaisySelect from '@components/ui/DaisySelect';
import EmployeeSearchPicker from '@components/ui/EmployeeSearchPicker';

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
    userType:   "Agent",
    from:       "",
    to:         "",
  };

  const [form,   setForm]   = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              employeeId: initial.employeeId ?? "",
              userType:   initial.userType   ?? "Agent",
              from:       initial.from       ?? "",
              to:         initial.to         ?? "",
            }
          : emptyForm
      );
      setSelectedEmployee(initial ? { id: initial.employeeId, name: initial.name } : null);
      setErrors({});
    }
  }, [isOpen, initial]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.employeeId.toString().trim()) {
      next.employeeId = t("modals.memberForm.errors.employeeIdRequired", "Employee ID is required");
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

        {/* Employee */}
        <div>
          <label style={labelStyle}>
            {t("modals.memberForm.employeeId", "Employee ID")}
            <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
          </label>
          <EmployeeSearchPicker
            active={isOpen}
            selected={selectedEmployee}
            onSelect={(emp) => { setSelectedEmployee(emp); set("employeeId", emp.id); }}
            onClear={() => { setSelectedEmployee(null); set("employeeId", ""); }}
            hasError={!!errors.employeeId}
            isRTL={isRTL}
            t={t}
            placeholder={t("modals.memberForm.employeeSearchPlaceholder", "Search by name or ID...")}
          />
          {errors.employeeId && <p style={errorStyle}>{errors.employeeId}</p>}
        </div>

        {/* User Type */}
        <div>
          <label style={labelStyle}>{t("modals.memberForm.userType", "User Type")}</label>
          <DaisySelect
            value={form.userType}
            options={USER_TYPES}
            onChange={(val) => set("userType", val)}
            hasError={!!errors.userType}
            translationPrefix="modals.memberForm.userTypes"
            t={t}
            isRTL={isRTL}
          />
          {errors.userType && <p style={errorStyle}>{errors.userType}</p>}
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

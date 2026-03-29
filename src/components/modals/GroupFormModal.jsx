import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { Boxes } from "lucide-react";

/**
 * Group Form Modal — Create & Edit Support Groups
 * @param {boolean}  isOpen   - Controls modal visibility
 * @param {function} onClose  - Callback when modal should close
 * @param {function} onSave   - Callback with form data when saved
 * @param {object|null} initial - Existing group data for edit mode (null = create)
 */
export default function GroupFormModal({ isOpen, onClose, onSave, initial = null }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isEdit = !!initial;

  const emptyForm = { name: "", validFrom: "", validTo: "", parentUnit: "" };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Sync form when opening or switching between create / edit
  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              name:       initial.name       ?? "",
              validFrom:  initial.validFrom  ?? "",
              validTo:    initial.validTo    ?? "",
              parentUnit: initial.parentUnit ?? "",
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
    
    const trimmedName = form.name.trim();
    const trimmedParentUnit = form.parentUnit.trim();
    
    if (!trimmedName) {
      next.name = t("modals.groupForm.errors.nameRequired", "Group name is required");
    } else if (trimmedName.length < 3) {
      next.name = t("modals.groupForm.errors.nameTooShort", "Group name must be at least 3 characters");
    } else if (trimmedName.length > 100) {
      next.name = t("modals.groupForm.errors.nameTooLong", "Group name must not exceed 100 characters");
    }
    
    if (!trimmedParentUnit) {
      next.parentUnit = t("modals.groupForm.errors.parentUnitRequired", "Parent unit is required");
    } else if (!/^[A-Z0-9-]+$/i.test(trimmedParentUnit)) {
      next.parentUnit = t("modals.groupForm.errors.parentUnitInvalid", "Parent unit must contain only letters, numbers, and hyphens");
    } else if (trimmedParentUnit.length > 50) {
      next.parentUnit = t("modals.groupForm.errors.parentUnitTooLong", "Parent unit must not exceed 50 characters");
    }
    
    if (form.validFrom && form.validTo && form.validFrom > form.validTo) {
      next.validTo = t("modals.groupForm.errors.dateOrder", "Valid To must be after Valid From");
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t("modals.groupForm.editTitle", "Edit Support Group")
          : t("modals.groupForm.newTitle",  "New Support Group")
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
          <Boxes size={26} color="#9d6806" />
        </div>
      }
      subtitle={
        isEdit
          ? t("modals.groupForm.editSubtitle", "Update the details of this support group")
          : t("modals.groupForm.newSubtitle",   "Fill in the details to create a new support group")
      }
    >
      <div dir={isRTL ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Support Group Name */}
        <div>
          <label style={labelStyle}>
            {t("modals.groupForm.name", "Support Group Name")}
            <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("modals.groupForm.namePlaceholder", "e.g. HR Support Team")}
            style={inputStyle(!!errors.name)}
            onFocus={(e) => { e.target.style.borderColor = "#fbbf24"; e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)"; }}
            onBlur={(e)  => { e.target.style.borderColor = errors.name ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        {/* Parent Unit Code */}
        <div>
          <label style={labelStyle}>
            {t("modals.groupForm.parentUnit", "Parent Unit Code")}
            <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
          </label>
          <input
            value={form.parentUnit}
            onChange={(e) => set("parentUnit", e.target.value)}
            placeholder={t("modals.groupForm.parentUnitPlaceholder", "e.g. MAIN-001")}
            style={inputStyle(!!errors.parentUnit)}
            onFocus={(e) => { e.target.style.borderColor = "#fbbf24"; e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)"; }}
            onBlur={(e)  => { e.target.style.borderColor = errors.parentUnit ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
          {errors.parentUnit && <p style={errorStyle}>{errors.parentUnit}</p>}
        </div>

        {/* Valid From / Valid To */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>{t("modals.groupForm.validFrom", "Valid From")}</label>
            <input
              type="date"
              value={form.validFrom}
              onChange={(e) => set("validFrom", e.target.value)}
              style={inputStyle(false)}
              onFocus={(e) => { e.target.style.borderColor = "#fbbf24"; e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>{t("modals.groupForm.validTo", "Valid To")}</label>
            <input
              type="date"
              value={form.validTo}
              onChange={(e) => set("validTo", e.target.value)}
              style={inputStyle(!!errors.validTo)}
              onFocus={(e) => { e.target.style.borderColor = "#fbbf24"; e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)"; }}
              onBlur={(e)  => { e.target.style.borderColor = errors.validTo ? "#ef4444" : "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
            {errors.validTo && <p style={errorStyle}>{errors.validTo}</p>}
          </div>
        </div>

        {/* Actions */}
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
            {t("modals.groupForm.cancel", "Cancel")}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit
              ? t("modals.groupForm.saveChanges", "Save Changes")
              : t("modals.groupForm.create",       "Create Group")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

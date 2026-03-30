import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import { UserPlus, UserCog } from "lucide-react";

// The three possible employment types shown in the Employee Class dropdown
const EMPLOYEE_CLASSES = ["Full-time", "Part-time", "Contractor"];

// Form layout config. Each sub-array is one row in the form.
// A row with 2 fields renders side-by-side (2-column grid);
// a row with 1 field spans the full width.
// - key:         matches the form state property name
// - labelKey:    i18n key suffix (e.g. 'employeeId' → 'modals.employeeForm.employeeId')
// - fallback:    English label if translation is missing
// - type:        input type, or 'select' for a dropdown (defaults to 'text')
// - required:    shows a red asterisk and is validated before saving
// - placeholder: hint text shown inside the input
// - options:     only for type='select' — list of option values
const FIELD_ROWS = [
  [
    { key: "employeeId",    labelKey: "employeeId",    fallback: "Employee ID",    required: true, placeholder: "e.g. EMP-0001" },
    { key: "employeeClass", labelKey: "employeeClass", fallback: "Employee Class", type: "select", options: EMPLOYEE_CLASSES },
  ],
  [
    { key: "name",          labelKey: "name",          fallback: "Employee Name",  required: true, placeholder: "Full name" },
  ],
  [
    { key: "email",         labelKey: "email",         fallback: "Email",          required: true, placeholder: "name@example.com", type: "email" },
  ],
  [
    { key: "entityCode",    labelKey: "entityCode",    fallback: "Entity Code",    required: true, placeholder: "e.g. E001" },
    { key: "entityName",    labelKey: "entityName",    fallback: "Entity Name",    required: true, placeholder: "e.g. HQ Corp" },
  ],
  [
    { key: "department",    labelKey: "department",    fallback: "Department",     required: true, placeholder: "e.g. HR & People Ops" },
    { key: "manager",       labelKey: "manager",       fallback: "Manager",        placeholder: "e.g. Ahmad Khalil" },
  ],
  [
    { key: "location",      labelKey: "location",      fallback: "Location",       placeholder: "e.g. Riyadh" },
    { key: "mobileNumber",  labelKey: "mobileNumber",  fallback: "Mobile Number",  placeholder: "e.g. +966501234567" },
  ],
];

// Reusable field component used by every form row.
// Renders: label → input (or select dropdown) → error message (if any).
function FormField({ fieldDef, value, error, onChange, t, inputStyle, labelStyle, errorStyle, focusHandlers }) {
  const { key, labelKey, fallback, required, placeholder, type, options } = fieldDef;
  return (
    <div>
      <label style={labelStyle}>
        {t(`modals.employeeForm.${labelKey}`, fallback)}
        {required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          style={{ ...inputStyle(false), cursor: "pointer" }}
          {...focusHandlers(key)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{t(`modals.employeeForm.classes.${opt}`, opt)}</option>
          ))}
        </select>
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={placeholder}
          style={inputStyle(!!error)}
          {...focusHandlers(key)}
        />
      )}
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

export default function EmployeeFormModal({ isOpen, onClose, onSave, initial = null }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isEdit = !!initial;

  // Default blank form used when opening the modal in "Add" mode
  const emptyForm = {
    employeeId: "", name: "", entityCode: "", entityName: "",
    department: "", employeeClass: "Full-time", manager: "",
    email: "", mobileNumber: "", location: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // When the modal opens, pre-fill the form with the employee's existing data
  // (edit mode) or reset it to blank (add mode)
  useEffect(() => {
    if (isOpen) {
      setForm(
        initial
          ? {
              employeeId:    initial.employeeId    ?? "",
              name:          initial.name          ?? "",
              entityCode:    initial.entityCode    ?? "",
              entityName:    initial.entityName    ?? "",
              department:    initial.department    ?? "",
              employeeClass: initial.employeeClass ?? "Full-time",
              manager:       initial.manager       ?? "",
              email:         initial.email         ?? "",
              mobileNumber:  initial.mobileNumber  ?? "",
              location:      initial.location      ?? "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [isOpen, initial]);

  // Updates a single field in the form state and clears its error (if any)
  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Validates required fields and formats. Returns true if everything is valid.
  const validate = () => {
    const next = {};
    const trimmedEmployeeId = form.employeeId.toString().trim();
    const trimmedName       = form.name.trim();
    const trimmedEmail      = form.email.trim();
    const trimmedEntityCode = form.entityCode.trim();
    const trimmedEntityName = form.entityName.trim();
    const trimmedDepartment = form.department.trim();

    if (!trimmedEmployeeId) {
      next.employeeId = t("modals.employeeForm.errors.employeeIdRequired", "Employee ID is required");
    } else if (trimmedEmployeeId.length > 20) {
      next.employeeId = t("modals.employeeForm.errors.employeeIdTooLong", "Employee ID must not exceed 20 characters");
    }
    if (!trimmedName) {
      next.name = t("modals.employeeForm.errors.nameRequired", "Employee name is required");
    } else if (trimmedName.length < 2) {
      next.name = t("modals.employeeForm.errors.nameTooShort", "Name must be at least 2 characters");
    } else if (trimmedName.length > 100) {
      next.name = t("modals.employeeForm.errors.nameTooLong", "Name must not exceed 100 characters");
    }
    if (!trimmedEmail) {
      next.email = t("modals.employeeForm.errors.emailRequired", "Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = t("modals.employeeForm.errors.emailInvalid", "Please enter a valid email address");
    }
    if (!trimmedEntityCode) next.entityCode = t("modals.employeeForm.errors.entityCodeRequired", "Entity code is required");
    if (!trimmedEntityName) next.entityName = t("modals.employeeForm.errors.entityNameRequired", "Entity name is required");
    if (!trimmedDepartment) next.department = t("modals.employeeForm.errors.departmentRequired", "Department is required");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Called when the user clicks Save. Validates first, then passes form data to the parent.
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
    appearance: "none",
  });

  const labelStyle = {
    display: "block", fontSize: "12px", fontWeight: "600",
    color: "#6b7280", marginBottom: "5px",
    textAlign: isRTL ? "right" : "left",
    textTransform: "uppercase", letterSpacing: "0.04em",
  };

  const errorStyle = {
    fontSize: "12px", color: "#ef4444",
    marginTop: "4px", textAlign: isRTL ? "right" : "left",
  };

  const focusHandlers = (errorKey) => ({
    onFocus: (e) => {
      e.target.style.borderColor = "#fbbf24";
      e.target.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.15)";
    },
    onBlur: (e) => {
      e.target.style.borderColor = errors[errorKey] ? "#ef4444" : "#e5e7eb";
      e.target.style.boxShadow = "none";
    },
  });

  // Shared style props passed to every FormField to avoid repetition
  const fieldProps = { t, inputStyle, labelStyle, errorStyle, focusHandlers };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t("modals.employeeForm.editTitle", "Edit Employee") : t("modals.employeeForm.addTitle", "Add Employee")}
      icon={
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(to bottom right, #fde047, #facc15)", boxShadow: "0 4px 6px -1px rgba(251, 191, 36, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isEdit ? <UserCog size={26} color="#9d6806" /> : <UserPlus size={26} color="#9d6806" />}
        </div>
      }
      subtitle={isEdit ? t("modals.employeeForm.editSubtitle", "Update employee details") : t("modals.employeeForm.addSubtitle", "Add a new employee to the directory")}
    >
      <div dir={isRTL ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {FIELD_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={row.length > 1 ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } : {}}
          >
            {row.map((fieldDef) => (
              <FormField
                key={fieldDef.key}
                fieldDef={fieldDef}
                value={form[fieldDef.key]}
                error={errors[fieldDef.key]}
                onChange={set}
                {...fieldProps}
              />
            ))}
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px", flexDirection: isRTL ? "row-reverse" : "row" }}>
          <button onClick={onClose} className="modal-cancel-button">
            {t("modals.employeeForm.cancel", "Cancel")}
          </button>
          <button onClick={handleSave} className="modal-save-button">
            {isEdit ? t("modals.employeeForm.saveChanges", "Save Changes") : t("modals.employeeForm.add", "Add Employee")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

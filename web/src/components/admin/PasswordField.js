"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./PasswordField.module.css";

/**
 * A password input with a show/hide toggle, matching the `.field` styling used
 * across the admin forms.
 */
export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "off",
  required = false,
  hint,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={styles.wrap}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className={styles.eye}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

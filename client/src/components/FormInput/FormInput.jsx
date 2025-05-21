import React from "react";
import styles from "./FormInput.module.css";

const FormInput = ({
  label,
  type,
  name,
  value,
  onChange,
  required,
  options,
  icon,
  placeholder,
  error,
}) => {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={styles.textarea}
            placeholder={placeholder}
          />
        );
      case "select":
        return (
          <div className={styles.selectWrapper}>
            <select
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              className={styles.select}
            >
              <option value="">Select category</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className={styles.selectArrow}>▼</span>
          </div>
        );
      default:
        return (
          <div className={styles.inputWrapper}>
            {icon && <img src={icon} alt="" className={styles.inputIcon} />}
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              className={`${styles.input} ${icon ? styles.withIcon : ""} ${error ? styles.inputError : ''}`}
              placeholder={placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      {renderInput()}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default FormInput;

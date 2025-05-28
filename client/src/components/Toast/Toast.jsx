import React, { useEffect } from "react";
import styles from "./Toast.module.css";

const Toast = ({ show, onClose, children }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.toast}>
      {children}
    </div>
  );
};

export default Toast; 
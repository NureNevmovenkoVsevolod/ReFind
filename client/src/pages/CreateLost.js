import React from "react";
import styles from "./CreateLost.module.css";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";
import { useNavigate } from "react-router-dom";

const CreateLost = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <span>←</span> Back
      </button>
        <div className={styles.header}>
          <h1>I Lost</h1>
        </div>
        <CreateAdvertForm type="lost" />
      </div>
    </div>
  );
};

export default CreateLost;

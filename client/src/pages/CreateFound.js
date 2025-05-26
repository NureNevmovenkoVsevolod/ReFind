import React from "react";
import styles from "./CreateFound.module.css";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";
import { useNavigate } from "react-router-dom";

const CreateFound = () => {
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
          <h1>I found</h1>
        </div>
        <CreateAdvertForm type="find" />
      </div>
    </div>
  );
};

export default CreateFound;

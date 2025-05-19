import React from "react";
import styles from "./CreateLost.module.css";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";

const CreateLost = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>I Lost</h1>
        </div>
        <CreateAdvertForm type="lost" />
      </div>
    </div>
  );
};

export default CreateLost;

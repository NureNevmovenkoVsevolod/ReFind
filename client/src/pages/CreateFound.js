import React from "react";
import styles from "./CreateFound.module.css";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";

const CreateFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>I found</h1>
        </div>
        <CreateAdvertForm type="find" />
      </div>
    </div>
  );
};

export default CreateFound;

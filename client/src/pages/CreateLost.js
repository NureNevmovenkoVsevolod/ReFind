import React from "react";
import styles from "./CreateLost.module.css";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";
import { useNavigate } from "react-router-dom";
import { t } from '../utils/i18n';

const CreateLost = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        aria-label={t('createLost.back')}
      >
        <span>←</span> {t('createLost.back')}
      </button>
        <div className={styles.header}>
          <h1>{t('createLost.title')}</h1>
        </div>
        <CreateAdvertForm type="lost" />
      </div>
    </div>
  );
};

export default CreateLost;

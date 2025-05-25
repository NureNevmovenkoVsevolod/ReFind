import React, { useState } from 'react';
import styles from './ModerNavBar.module.css';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ModerNavBar({ onLogout }) {
  const [activeTab, setActiveTab] = useState('announcements');
    const navigate = useNavigate();

    const goToAnn = () => {
        navigate("/moder/advertisments")
    }
    const goToStat = () => {
        navigate("/moder/stats")
    }
    const goToCompl = () => {
        navigate("/moder/complaints")
    }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Панель модератора ReFind</h1>
            <p className={styles.subtitle}>
              Статистики та Управління оголошеннями й скаргами
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
          <Button
            className={styles.logout}
            variant="outline-danger"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <div className={styles.navContent}>
        <button
            className={`${styles.navButton} ${activeTab === 'announcements' ? styles.navButtonActive : ''}`}
            onClick={() => {
              setActiveTab('announcements');
              goToAnn();
            }}
          >
            📝 Заявки на публікацію
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'statistics' ? styles.navButtonActive : ''}`}
            onClick={() => {
                setActiveTab('statistics'); 
                goToStat()
            }}
          >
            📊 Статистика
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'complaints' ? styles.navButtonActive : ''}`}
            onClick={() => {
                setActiveTab('complaints'); 
                goToCompl()
            }}
          >
            🚨 Скарги
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModerNavBar;

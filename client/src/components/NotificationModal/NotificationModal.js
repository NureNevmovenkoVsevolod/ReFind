import React from 'react';
import styles from './NotificationModal.module.css';

const NotificationModal = ({ onEnable, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Увімкнути сповіщення</h2>
        <p>Отримуйте миттєві сповіщення про нові оголошення у ваших улюблених категоріях!</p>
        <p>Дозвольте сповіщення, щоб не пропустити важливі оновлення.</p>
        <div className={styles.modalFooter}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Пізніше
          </button>
          <button className={styles.primaryButton} onClick={onEnable}>
            Увімкнути сповіщення
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal; 
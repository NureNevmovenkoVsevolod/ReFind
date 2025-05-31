import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './SuccessModal.module.css'; // Створимо CSS файл для додаткових стилів

const SuccessModal = ({ show, handleClose, message, hideOkButton }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className={styles.modalBody}>
        <div className={styles.content}>
          <h4 className={styles.title}>{message}</h4>
        </div>
        {!hideOkButton && (
          <Button variant="primary" onClick={handleClose} className={styles.closeButton}>
            ОК
          </Button>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal;
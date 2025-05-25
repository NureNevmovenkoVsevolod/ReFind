import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import styles from './ModFormModal.module.css';

const ModFormModal = ({ show, handleClose, mod, onSubmit }) => {
  const [formData, setFormData] = useState({
    mod_email: '',
    mod_password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (mod) {
      setFormData({
        mod_email: mod.mod_email || '',
        mod_password: '',
      });
    } else {
      setFormData({
        mod_email: '',
        mod_password: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [mod]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'mod_email':
        if (!value.trim()) {
          error = "Email обов'язковий";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Введіть коректний email";
          }
        }
        break;

      case 'mod_password':
        if (!mod && !value) {
          error = "Пароль обов'язковий";
        } else if (value && value.length < 6) {
          error = "Пароль має містити мінімум 6 символів";
        } else if (value && (!/[A-Za-z]/.test(value) || !/\d/.test(value))) {
          error = "Пароль має містити хоча б одну літеру та одну цифру";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Очищаємо помилку сервера при зміні даних
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      try {
        await onSubmit(formData, mod?.mod_id);
      } catch (error) {
        if (error.response?.data?.message) {
          setServerError(error.response.data.message);
        } else {
          setServerError('Помилка при збереженні модератора');
        }
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mod ? 'Редагувати модератора' : 'Створити модератора'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalContent}>
        {serverError && (
          <Alert variant="danger" className="mb-3">
            {serverError}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Email</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="email"
              name="mod_email"
              value={formData.mod_email}
              onChange={handleChange}
              isInvalid={!!errors.mod_email}
            />
            <Form.Control.Feedback type="invalid" className={styles.invalidFeedback}>
              {errors.mod_email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Пароль</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="password"
              name="mod_password"
              value={formData.mod_password}
              onChange={handleChange}
              isInvalid={!!errors.mod_password}
              placeholder={mod ? "Залиште порожнім, щоб не змінювати" : ""}
            />
            <Form.Control.Feedback type="invalid" className={styles.invalidFeedback}>
              {errors.mod_password}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button variant="secondary" onClick={handleClose}>
          Скасувати
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {mod ? 'Зберегти' : 'Створити'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModFormModal; 
import React, {useState, useEffect} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from './UserFormModal.module.css';
import axios from 'axios';

const UserFormModal = ({ show, handleClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    is_blocked: false,
    blocked_until: '',
    user_pfp: ''
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const validateField = (name, value, isEdit) => {
    let error = '';

    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          error = "Ім'я обов'язкове";
        } else if (value.trim().length < 2) {
          error = "Ім'я має містити мінімум 2 символи";
        }
        break;

      case 'last_name':
        if (!value.trim()) {
          error = "Прізвище обов'язкове";
        } else if (value.trim().length < 2) {
          error = "Прізвище має містити мінімум 2 символи";
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = "Email обов'язковий";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Введіть коректний email";
          }
        }
        break;

      case 'password':
        if (!isEdit) {
          if (!value) {
            error = "Пароль обов'язковий";
          } else if (value.length < 6) {
            error = "Пароль має містити мінімум 6 символів";
          } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
            error = "Пароль має містити хоча б одну літеру та одну цифру";
          }
        }
        break;

      case 'phone_number':
        if (value) {
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 10 || digitsOnly.length > 13) {
            error = "Номер телефону має містити від 10 до 13 цифр";
          }
        }
        break;

      case 'blocked_until':
        if (formData.is_blocked && !value) {
          error = "Вкажіть дату блокування";
        } else if (formData.is_blocked && value) {
          const selectedDate = new Date(value);
          const now = new Date();
          if (selectedDate <= now) {
            error = "Час блокування має бути в майбутньому";
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = (data, isEdit) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(data).forEach(key => {
      const error = validateField(key, data[key], isEdit);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const response = await axios.post('/api/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData(prev => ({
        ...prev,
        user_pfp: response.data.avatarUrl
      }));
    } catch (error) {
      console.error('Помилка завантаження аватара:', error);
      setErrors(prev => ({
        ...prev,
        avatar: 'Помилка завантаження аватара'
      }));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        password: '',
        is_blocked: user.is_blocked || false,
        blocked_until: user.blocked_until ? new Date(user.blocked_until).toLocaleString('sv', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).slice(0, 16) : '',
        user_pfp: user.user_pfp || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        is_blocked: false,
        blocked_until: '',
        user_pfp: ''
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    const error = validateField(name, newValue, !!user);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm(formData, !!user)) {
      const submitData = { ...formData };

      if (user && !submitData.password) {
        delete submitData.password;
      }

      if (submitData.is_blocked) {
        submitData.blocked_at = new Date().toISOString();
        if (submitData.blocked_until) {
          const localDate = new Date(submitData.blocked_until);
          submitData.blocked_until = localDate.toISOString();
        }
      } else {
        submitData.blocked_at = null;
        submitData.blocked_until = null;
      }

      submitData.auth_provider = 'local';
      
      onSubmit(submitData, user?.user_id);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{user ? 'Редагувати користувача' : 'Створити користувача'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Аватар</Form.Label>
            <div className={styles.avatarUpload}>
              {formData.user_pfp && (
                <img 
                  src={formData.user_pfp} 
                  alt="Avatar preview" 
                  className={styles.avatarPreview} 
                />
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && <div className={styles.uploading}>Завантаження...</div>}
              {errors.avatar && (
                <div className="text-danger">{errors.avatar}</div>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ім'я</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              isInvalid={!!errors.first_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.first_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Прізвище</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              isInvalid={!!errors.last_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.last_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Телефон</Form.Label>
            <Form.Control
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              isInvalid={!!errors.phone_number}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone_number}
            </Form.Control.Feedback>
          </Form.Group>

          {!user && (
            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {user && (
            <>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="is_blocked"
                  label="Заблокований"
                  checked={formData.is_blocked}
                  onChange={handleChange}
                />
              </Form.Group>

              {formData.is_blocked && (
                <Form.Group className="mb-3">
                  <Form.Label>Заблоковано до</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="blocked_until"
                    value={formData.blocked_until}
                    onChange={handleChange}
                    isInvalid={!!errors.blocked_until}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.blocked_until}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Скасувати
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={uploading}>
          {user ? 'Зберегти' : 'Створити'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserFormModal; 
import React, {useState, useEffect} from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from './UserFormModal.module.css';

const UserFormModal = ({ show, handleClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    is_blocked: false,
    blocked_until: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        password: '',
        is_blocked: user.is_blocked || false,
        blocked_until: user.blocked_until ? new Date(user.blocked_until).toISOString().slice(0, 16) : ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        is_blocked: false,
        blocked_until: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };

    if (submitData.is_blocked) {
      submitData.blocked_at = new Date().toISOString();
    } else {
      submitData.blocked_at = null;
      submitData.blocked_until = null;
    }

    submitData.auth_provider = 'local';
    
    onSubmit(submitData, user?.user_id);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{user ? 'Редагувати користувача' : 'Створити користувача'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ім'я</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Прізвище</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Телефон</Form.Label>
            <Form.Control
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </Form.Group>

          {!user && (
            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
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
                    required={formData.is_blocked}
                  />
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
        <Button variant="primary" onClick={handleSubmit}>
          {user ? 'Зберегти' : 'Створити'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserFormModal; 
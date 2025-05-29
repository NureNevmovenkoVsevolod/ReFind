import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './ComplaintModal.module.css';

const ComplaintModal = ({ show, handleClose, onSubmit, advertisementTitle }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Заголовок обов\'язковий');
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Залишити скаргу</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Заголовок скарги *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={error ? styles.errorInput : ''}
                            placeholder="Введіть заголовок скарги"
                        />
                        {error && <div className={styles.errorMessage}>{error}</div>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="description">Опис скарги</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Опишіть детальніше вашу скаргу"
                            rows="4"
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Назад
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Відправити скаргу
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ComplaintModal; 
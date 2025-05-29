import React, { useState } from 'react';
import styles from './ComplaintCard.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { encodeId } from '../../utils/encodeId';
import { Modal, Button } from 'react-bootstrap';

function ComplaintCard({ complaint, onStatusChange }) {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleReject = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_SERVER_URL}/api/complaints/${complaint.id}/reject`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            onStatusChange();
        } catch (error) {
            console.error('Помилка при відхиленні скарги:', error);
        }
    };

    const handleDeleteAdvertisement = async () => {
        try {
            setDeleteLoading(true);
            await axios.delete(
                `${process.env.REACT_APP_SERVER_URL}/api/complaints/${complaint.id}/advertisement`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            onStatusChange();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Помилка при видаленні оголошення:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleViewAdvertisement = () => {
        const encodedId = encodeId(complaint.advertisement.id);
        navigate(`/advertisement/${encodedId}`);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.userInfo}>
                        <img 
                            src={complaint.user.avatar || require('../../assets/user.png')} 
                            alt={complaint.user.name} 
                            className={styles.avatar}
                        />
                        <div className={styles.userDetails}>
                            <h3>{complaint.user.name}</h3>
                            <p>{new Date(complaint.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className={styles.status}>
                        <span className={`${styles.statusBadge} ${styles[complaint.status]}`}>
                            {complaint.status === 'pending' ? 'Очікує' : 
                             complaint.status === 'rejected' ? 'Відхилено' : 'Вирішено'}
                        </span>
                    </div>
                </div>

                <div className={styles.content}>
                    <h2>{complaint.advertisement.title}</h2>
                    <p className={styles.complaintText}>{complaint.text}</p>
                    
                    <div className={styles.advertisementPreview}>
                        <h4>Оголошення:</h4>
                        <p>{complaint.advertisement.description}</p>
                        {complaint.advertisement.images.length > 0 && (
                            <div className={styles.imagePreview}>
                                <img 
                                    src={complaint.advertisement.images[0]} 
                                    alt="Превью оголошення" 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        className={`${styles.button} ${styles.viewButton}`}
                        onClick={handleViewAdvertisement}
                    >
                        Переглянути оголошення
                    </button>
                    {complaint.status === 'pending' && (
                        <>
                            <button 
                                className={`${styles.button} ${styles.rejectButton}`}
                                onClick={handleReject}
                            >
                                Відхилити скаргу
                            </button>
                            <button 
                                className={`${styles.button} ${styles.deleteButton}`}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Видалити оголошення
                            </button>
                        </>
                    )}
                </div>
            </div>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Підтвердіть видалення</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Ви дійсно хочете видалити оголошення "{complaint.advertisement.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Скасувати
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteAdvertisement} 
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? "Видалення..." : "Видалити"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ComplaintCard; 
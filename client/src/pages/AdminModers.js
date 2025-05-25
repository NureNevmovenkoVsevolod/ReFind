import React, { useState, useEffect } from 'react';
import AdminNavBar from '../components/AdminNavBar/AdminNavBar';
import AdminFooter from '../components/AdminFooter/AdminFooter';
import axios from 'axios';
import styles from './AdminPanel.module.css';
import { Row, Col, Button } from 'react-bootstrap';
import Loader from '../components/Loader/Loader';
import ModFormModal from '../components/Modal/ModFormModal';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

function AdminModers() {
    const [mods, setMods] = useState([]);
    const [selectedMod, setSelectedMod] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setIsLoading(false);
            return;
        }
        setToken(storedToken);
        fetchMods(storedToken);
    }, []);

    const fetchMods = async (authToken) => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/moder", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setMods(res.data);
        } catch (err) {
            console.error("Failed to fetch moderators", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMod = async (modId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цього модератора?')) {
            return;
        }

        setIsLoading(true);
        try {
            await axios.delete(`/api/moder/${modId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchMods(token);
        } catch (err) {
            console.error("Failed to delete moderator", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowCreateModal = () => {
        setSelectedMod(null);
        setShowCreateModal(true);
    };

    const handleShowEditModal = (mod) => {
        setSelectedMod(mod);
        setShowEditModal(true);
    };

    const handleCloseFormModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedMod(null);
    };

    const handleSubmitModForm = async (values, modId) => {
        setIsLoading(true);
        try {
            if (modId) {
                await axios.put(`/api/moder/${modId}`, values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post('/api/moder', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            handleCloseFormModal();
            fetchMods(token);
        } catch (err) {
            console.error('Помилка при збереженні модератора:', err);
            if (err.response) {
                alert(err.response.data.message || 'Помилка при збереженні модератора');
            } else {
                alert('Помилка при збереженні модератора');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.adminLayout}>
            <AdminNavBar onLogout={handleLogout} />
            <div className={styles.content}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Управління модераторами</h1>
                    <Button variant="primary" onClick={handleShowCreateModal}>
                        Створити модератора
                    </Button>
                </div>
                
                <div className="mb-4">
                    <h3>Загальна кількість модераторів: {mods.length}</h3>
                </div>

                {isLoading ? (
                    <div className="d-flex justify-content-center">
                        <Loader />
                    </div>
                ) : (
                    <Row>
                        {mods.map(mod => (
                            <Col key={mod.mod_id} xs={12} md={6} lg={4} className="mb-4">
                                <div className={styles.modCard}>
                                    <div className={styles.modInfo}>
                                        <h4>{mod.mod_email}</h4>
                                    </div>
                                    <div className={styles.modActions}>
                                        <Button 
                                            variant="danger"
                                            onClick={() => handleDeleteMod(mod.mod_id)}
                                        >
                                            Видалити
                                        </Button>
                                        <Button 
                                            variant="primary"
                                            onClick={() => handleShowEditModal(mod)}
                                        >
                                            Редагувати
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}

                <ModFormModal
                    show={showCreateModal || showEditModal}
                    handleClose={handleCloseFormModal}
                    mod={selectedMod}
                    onSubmit={handleSubmitModForm}
                />
            </div>
            <AdminFooter />
        </div>
    );
}

export default AdminModers;
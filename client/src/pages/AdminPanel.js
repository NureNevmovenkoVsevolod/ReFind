import React, { useState, useEffect } from 'react';
import AdminNavBar from '../components/AdminNavBar/AdminNavBar';
import AdminFooter from '../components/AdminFooter/AdminFooter';
import axios from 'axios';
import styles from './AdminPanel.module.css';
import { Row, Col, Button } from 'react-bootstrap';
import UserCard from '../components/UserCard/UserCard';
import Loader from '../components/Loader/Loader';
import UserDetailsModal from '../components/Modal/UserDetailsModal';
import UserFormModal from '../components/Modal/UserFormModal';


axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchUsers(storedToken);
  }, []);

  const fetchUsers = async (authToken) => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers(token);
    } catch (err) {
      console.error("Failed to delete user", err);
    } finally {
       setIsLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowInfoModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowInfoModal(false);
    setSelectedUser(null);
  };

  const handleShowCreateModal = () => {
    setSelectedUser(null);
    setShowCreateModal(true);
  };

  const handleShowEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCloseFormModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleSubmitUserForm = async (values, userId) => {
    setIsLoading(true);
    try {
      if (userId) {
        await axios.put(`/api/user/${userId}`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post('/api/user', values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      handleCloseFormModal();
      fetchUsers(token);
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
          <h1>Управління користувачами</h1>
          <Button variant="primary" onClick={handleShowCreateModal}>
            Створити користувача
          </Button>
        </div>
        
        <div className="mb-4">
          <h3>Загальна кількість користувачів: {users.length}</h3>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center">
            <Loader />
          </div>
        ) : (
          <Row>
            {users.map(user => (
              <Col key={user.user_id} xs={12} className="mb-4">
                <UserCard 
                  user={user}
                  onEdit={handleShowEditModal}
                  onDelete={handleDeleteUser}
                  onViewDetails={handleViewDetails}
                />
              </Col>
            ))}
          </Row>
        )}

        <UserDetailsModal
          show={showInfoModal}
          handleClose={handleCloseDetailsModal}
          user={selectedUser}
        />

        <UserFormModal
          show={showCreateModal || showEditModal}
          handleClose={handleCloseFormModal}
          user={selectedUser}
          onSubmit={handleSubmitUserForm}
        />

      </div>
      <AdminFooter />
    </div>
  );
}

export default AdminPanel; 
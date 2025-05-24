import React from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import styles from './UserDetailsModal.module.css';


const UserDetailsModal = ({ show, handleClose, user }) => {
  if (!user) {
    return null;
  }

  const userStatus = user.is_blocked ? 'Заблокований' : 'Активний';
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Деталі користувача</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.userDetailsContainer}>

          <div className={styles.avatarSection}>
            {user.user_pfp ? (
              <img src={user.user_pfp} alt={`${user.username}'s avatar`} className={styles.avatarImage} />
            ) : (
              <div className={styles.initialsAvatar}>
                {`${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || user.username?.charAt(0).toUpperCase() || ''}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <p><strong>Ім'я:</strong> {fullName || 'Не вказано'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.phone_number && (
              <p className={styles.contactItem}>
                
                <strong>Телефон:</strong> {user.phone_number}
              </p>
            )}
            <p className={styles.contactItem}>
              
              <strong>Тип авторизації:</strong> {user.auth_provider}
            </p>
            
            <p><strong>Статус:</strong> {userStatus}</p>

            {user.is_blocked && (
              <>
                <p><strong>Заблоковано з:</strong> {user.blocked_at ? new Date(user.blocked_at).toLocaleString() : 'Не вказано'}</p>
                <p><strong>Заблоковано до:</strong> {user.blocked_until ? new Date(user.blocked_until).toLocaleString() : 'Не вказано'}</p>
              </>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Закрити
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailsModal; 
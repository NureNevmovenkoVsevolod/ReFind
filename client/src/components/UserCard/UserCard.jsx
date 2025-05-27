import React from 'react';
import styles from './UserCard.module.css';
import authIcon from "../../assets/insurance.png";
import phoneIcon from "../../assets/phone.png";
import { Image } from 'react-bootstrap';

const UserCard = ({ user, onEdit, onDelete, onViewDetails }) => {
  const userStatus = user.is_blocked ? 'Заблокований' : 'Активний';

  // Отримуємо перші літери імені та прізвища
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const userInitials = getInitials(user.first_name, user.last_name);

  return (
    <div className={styles.userCard}>
      <div className={styles.cardBody}>
        <div className={styles.userInfoTop}>
          <div className={styles.avatarContainer}>
            {/* Відображаємо фото користувача, якщо воно є, інакше - перші літери */}
            {user.user_pfp ? (
              <img src={user.user_pfp} alt={`${user.username}'s avatar`} className={styles.avatarImage} />
            ) : (
              <div className={styles.initialsAvatar}>{userInitials || user.username?.charAt(0).toUpperCase() || ''}</div>
            )}
          </div>
          <div className={styles.mainDetails}>
            <div className={styles.userName}>{user.first_name || ''} {user.last_name || ''}</div>
            <div className={styles.userHandle}>{user.email}</div>
            <div className={`${styles.statusBadge} ${user.is_blocked ? styles.blocked : styles.active}`}>{userStatus}</div>
          </div>
        </div>
        <div className={styles.contactDetails}>
            {user.phone_number && (
              <div className={styles.contactItem}>
                  <Image src={phoneIcon} className={styles.contactIconImage} alt="phone"></Image>
                  <span>{user.phone_number}</span>
              </div>
            )}
            <div className={styles.contactItem}>
                <Image src={authIcon} className={styles.contactIconImage} alt="auth provider"></Image>
                <span>{user.auth_provider}</span>
            </div>
        </div>
        <div className={styles.actionsRow}>
            <button className={`${styles.button} ${styles.viewButton}`} onClick={() => onViewDetails(user)}>
                <i className="bi bi-eye"></i> Переглянути
            </button>
            <div className={styles.actionButtons}>
                <button className={`${styles.button} ${styles.editButton}`} onClick={(e) => {
                    e.stopPropagation();
                    onEdit(user);
                }}>
                    Редагувати
                </button>
                <button className={`${styles.button} ${styles.deleteButton}`} onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
                        onDelete(user.user_id);
                    }
                }}>
                    Видалити
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 
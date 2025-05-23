import React from 'react';
import AdminNavBar from '../components/AdminNavBar/AdminNavBar';
import AdminFooter from '../components/AdminFooter/AdminFooter';
import styles from './AdminPanel.module.css';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };



  return (
    <div className={styles.adminLayout}>
      <AdminNavBar onLogout={handleLogout} />
        
      <AdminFooter />
    </div>
  );
}

export default AdminPanel; 
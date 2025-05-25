import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./AdminNavBar.module.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

function AdminNavBar({ onLogout }) {
  const navigate = useNavigate();
  
  const goToMain = () => {
    navigate("/admin");
  };
  const goToMods = () => {
    navigate("/admin/mods");
  }

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container fluid className="d-flex justify-content-between align-items-center px-5">
        <Navbar.Brand
          onClick={goToMain}
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "24px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <Image src={logo} className={styles.logo} style={{ cursor: "pointer" }}></Image>
          ReFind Admin
        </Navbar.Brand>

        <Nav className="mx-auto gap-4">
          <Button variant="outline-light" onClick={goToMain} className={styles.navButton}>
            CRUD над користувачами
          </Button>
          <Button variant="outline-light" onClick={goToMods} className={styles.navButton}>
          CRUD над модерацією
          </Button>
        </Nav>

        <div className="d-flex align-items-center gap-3">
          <Button
            className={styles.logout}
            variant="outline-danger"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default AdminNavBar; 
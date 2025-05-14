import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./AuthNavBar.module.css";
import user from "../../assets/user.png";
import logo from "../../assets/logo.png";

function AuthNavBar({ onLogout }) {
  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container
        fluid
        className="d-flex justify-content-between align-items-center px-5"
      >
        <Navbar.Brand href="#" className="pl-2">
          <Image src={logo} />
          <Navbar.Brand
            style={{
              color: "black",
              fontWeight: "bold",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ReFind
          </Navbar.Brand>
        </Navbar.Brand>

        <Nav className="mx-auto gap-4">
          <Button href="#ifound" className={styles.text}>
            I Found
          </Button>
          <Button href="#ilost" className={styles.text}>
            I Lost
          </Button>
          <Button href="#boardfound" className={styles.text}>
            Board Found
          </Button>
          <Button href="#boardlost" className={styles.text}>
            Board Lost
          </Button>
          <Button href="#chat" className={styles.text}>
            Chat
          </Button>
        </Nav>

        <div className="d-flex align-items-center gap-3">
          <Button>
            <Image src={user} />
          </Button>

          <Button
            className={styles.logout}
            style={{ fontSize: "18px" }}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default AuthNavBar;

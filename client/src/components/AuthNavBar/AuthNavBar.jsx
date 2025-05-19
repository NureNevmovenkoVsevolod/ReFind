import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./AuthNavBar.module.css";
import user from "../../assets/user.png";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

function AuthNavBar({ onLogout }) {
  const navigate = useNavigate();
  const goToMain = () => {
    navigate("/");
  };
  const goToCreateLost = () => {
    navigate("/lost/create");
  };

  const goToCreateFound = () => {
    navigate("/found/create");
  };

  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container
        fluid
        className="d-flex justify-content-between align-items-center px-5"
      >
        <Navbar.Brand
          onClick={goToMain}
          style={{
            color: "black",
            fontWeight: "bold",
            fontSize: "24px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <Image src={logo} style={{ cursor: "pointer" }}></Image>
          ReFind
        </Navbar.Brand>

        <Nav className="mx-auto gap-4">
          <Button onClick={goToCreateFound} className={styles.text}>
            I Found
          </Button>
          <Button onClick={goToCreateLost} className={styles.text}>
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

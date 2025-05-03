import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo.png";

function NavBar(props) {
  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Container
        fluid
        className="d-flex justify-content-between align-items-center px-5"
      >
        <Image src={logo}></Image>
        <Navbar.Brand
          style={{ color: "black", fontWeight: "bold", fontSize: "24px" }}
        >
          ReFind
        </Navbar.Brand>

        <Nav className="ms-auto d-flex flex-row gap-2">
          <Button className={styles.register} style={{ fontSize: "18px" }}>
            Register
          </Button>
          <Button className={styles.login} style={{ fontSize: "18px" }}>
            Login
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;

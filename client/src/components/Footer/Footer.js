import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Image from "react-bootstrap/Image";
import logo from "../../assets/logo.png";

function Footer(props) {
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
          <span>Privacy Policy</span>
          <span>© 2025 ReFind</span>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Footer;

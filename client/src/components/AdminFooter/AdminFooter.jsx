import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import styles from "./AdminFooter.module.css";

function AdminFooter() {
  return (
    <footer className={styles.footer}>
      <Container className="d-flex justify-content-between align-items-center">
      <Row className="">
          <span>Privacy Policy</span>
        </Row>
      <Row className="">
          <span>© 2025 ReFind</span>
        </Row>
      </Container>
    </footer>
  );
}

export default AdminFooter; 
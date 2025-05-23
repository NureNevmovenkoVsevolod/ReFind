import React from "react";
import { Button, Row } from "react-bootstrap";
import styles from "./ShowMoreButton.module.css";
import Loader from "../Loader/Loader";

function ShowMoreButton({ loading, onClick }) {
  return (
    <Row className="justify-content-center mt-4 mb-5">
      <Button
        variant="outline-primary"
        className={styles.showMoreButton}
        onClick={onClick}
        disabled={loading}
      >
        {loading ? <Loader/> : "Show more"}
      </Button>
    </Row>
  );
}

export default ShowMoreButton;

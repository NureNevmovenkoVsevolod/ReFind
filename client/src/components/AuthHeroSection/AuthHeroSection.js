import React from "react";
import { Container, Row, Button, Image } from "react-bootstrap";
import styles from "./AuthHeroSection.module.css";
import arrow from "../../assets/arrow.png";
import { useNavigate } from "react-router-dom";

const AuthHeroSection = () => {
  const navigate = useNavigate();
  const goToCreateLost = () => {
    navigate("/lost/create");
  };

  const goToCreateFound = () => {
    navigate("/found/create");
  };

  return (
    <Container className={`${styles.img}`}>
      <section
        className={`d-flex justify-content-start align-items-center ${styles.section}`}
      >
        <h1 className={styles.heroTitle}>
          Integrity <br /> is rewarded
        </h1>
        <div className={styles.buttonsGroup}>
          <Button
            className={styles.reportButton}
            variant="secondary"
            onClick={goToCreateFound}
          >
            Report found
          </Button>
          <Button
            className={styles.reportButton}
            variant="outline-primary"
            onClick={goToCreateLost}
          >
            Report lost
          </Button>
        </div>
      </section>
      <Row className="d-flex justify-content-center">
        <Button
          style={{ maxWidth: "100px", marginBottom: "50px" }}
          variant={"outline-light"}
          className={styles.arrowButton}
        >
          <Image src={arrow} className={styles.arrow}></Image>
        </Button>
      </Row>
    </Container>
  );
};

export default AuthHeroSection;

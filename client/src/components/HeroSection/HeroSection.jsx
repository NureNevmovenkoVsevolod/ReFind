import React from "react";
import { Container, Row, Button, Image } from "react-bootstrap";
import styles from "./HeroSection.module.css";
import arrow from "../../assets/arrow.png";

const HeroSection = () => {
  const scrollToCurrentFinds = () => {
    const currentFindsSection = document.getElementById('current-finds');
    if (currentFindsSection) {
      currentFindsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Container className={`${styles.img}`}>
      <section
        className={`d-flex justify-content-start align-items-center ${styles.section}`}
      >
        <h1 className={styles.heroTitle}>
          Integrity <br /> is rewarded
        </h1>
      </section>
      <Row className="d-flex justify-content-center">
        <Button
          style={{ maxWidth: "100px", marginBottom: "50px" }}
          variant={"outline-light"}
          className={styles.arrowButton}
          onClick={scrollToCurrentFinds}
        >
          <Image src={arrow} className={styles.arrow}></Image>
        </Button>
      </Row>
    </Container>
  );
};

export default HeroSection;

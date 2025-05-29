import React from "react";
import { Container, Row, Button, Image } from "react-bootstrap";
import styles from "./HeroSection.module.css";
import arrow from "../../assets/arrow.png";
import { t } from '../../utils/i18n';

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
        <h1 className={styles.heroTitle} style={{ textAlign: 'left', whiteSpace: 'pre-line' }}>
          {t('main.heroTitle').split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx !== t('main.heroTitle').split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
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

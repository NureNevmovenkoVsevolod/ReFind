import React from "react";
import { Container, Row, Button, Image } from "react-bootstrap";
import styles from "./AuthHeroSection.module.css";
import arrow from "../../assets/arrow.png";
import { useNavigate } from "react-router-dom";
import { t } from '../../utils/i18n';

const AuthHeroSection = () => {
  const navigate = useNavigate();
  const goToCreateLost = () => {
    navigate("/lost/create");
  };

  const goToCreateFound = () => {
    navigate("/found/create");
  };
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
        <div className={styles.buttonsGroup}>
          <Button
            className={styles.reportButton}
            variant="secondary"
            onClick={goToCreateFound}
          >
            {t('main.reportFound')}
          </Button>
          <Button
            className={styles.reportButton}
            variant="outline-primary"
            onClick={goToCreateLost}
          >
            {t('main.reportLost')}
          </Button>
        </div>
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

export default AuthHeroSection;

import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { t, getLanguage, setLanguage } from "../../utils/i18n";

function NavBar() {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState(getLanguage());

  const handleLangSwitch = () => {
    const newLang = lang === "en" ? "uk" : "en";
    setLanguage(newLang);
    setLang(newLang);
    window.location.reload(); // простий спосіб для оновлення всіх текстів
  };

  const goToRegistration = () => {
    navigate("/registration");
  };
  const goToLogin = () => {
    navigate("/login");
  };
  const goToMain = () => {
    navigate("/");
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

        <Nav className="ms-auto d-flex flex-row gap-2 align-items-center">
          <span className={styles.langSwitcher} onClick={handleLangSwitch} title={lang === 'en' ? 'Switch to Ukrainian' : 'Switch to English'} aria-label={lang === 'en' ? 'Switch to Ukrainian' : 'Switch to English'}>
            {lang === "en" ? (
              <img src="/flags/us.svg" alt="EN" width={28} height={20} />
            ) : (
              <img src="/flags/ua.svg" alt="UA" width={28} height={20} />
            )}
          </span>
          <Button
            onClick={goToRegistration}
            className={styles.register}
            style={{ fontSize: "18px" }}
          >
            {t('navbar.register')}
          </Button>
          <Button
            onClick={goToLogin}
            className={styles.login}
            style={{ fontSize: "18px" }}
          >
            {t('navbar.login')}
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;

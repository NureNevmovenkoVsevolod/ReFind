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
import { t, getLanguage, setLanguage } from "../../utils/i18n";

function AuthNavBar({ onLogout, userData }) {
  const navigate = useNavigate();
  const [lang, setLang] = React.useState(getLanguage());
  const handleLangSwitch = () => {
    const newLang = lang === "en" ? "uk" : "en";
    setLanguage(newLang);
    setLang(newLang);
    window.location.reload();
  };
  const goToMain = () => {
    navigate("/");
  };
  const goToCreateLost = () => {
    navigate("/lost/create");
  };
  const goToBoardFound = () => {
    navigate("/boardfound");
  };
  const goToBoardLost = () => {
    navigate("/boardlost");
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
            {t('navbar.ifound')}
          </Button>
          <Button onClick={goToCreateLost} className={styles.text}>
            {t('navbar.ilost')}
          </Button>
          <Button onClick={goToBoardFound} className={styles.text}>
            {t('navbar.boardfound')}
          </Button>
          <Button onClick={goToBoardLost} className={styles.text}>
            {t('navbar.boardlost')}
          </Button>
          <Button href="#chat" className={styles.text}>
            {t('navbar.chat')}
          </Button>
        </Nav>

        <div className="d-flex align-items-center gap-3">
          <span className={styles.langSwitcher} onClick={handleLangSwitch} title={lang === 'en' ? 'Switch to Ukrainian' : 'Switch to English'} aria-label={lang === 'en' ? 'Switch to Ukrainian' : 'Switch to English'}>
            {lang === "en" ? (
              <img src="/flags/us.svg" alt="EN" width={28} height={20} />
            ) : (
              <img src="/flags/ua.svg" alt="UA" width={28} height={20} />
            )}
          </span>
          <Button className={styles.userButton} onClick={() => navigate('/profile')}>
            <Image 
              src={userData?.user_pfp || user} 
              style={{ 
                width: '40px', 
                height: '40px', 
                objectFit: 'cover',
                borderRadius: userData?.user_pfp ? '50%' : '0'
              }} 
              alt={userData?.first_name || 'User avatar'}
            />
          </Button>

          <Button
            className={styles.logout}
            style={{ fontSize: "18px" }}
            onClick={onLogout}
          >
            {t('navbar.logout')}
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default AuthNavBar;

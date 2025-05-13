import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo.png";
import {useNavigate} from "react-router-dom";


function NavBar(props) {
    const navigate = useNavigate();
    const goToRegistration = () => {
        navigate('/registration');
    };
    const goToLogin = () => {
        navigate('/login');
    };
    const goToMain = () => {
        navigate('/');
    };

    return (
        <Navbar bg="primary" data-bs-theme="dark">
            <Container
                fluid
                className="d-flex justify-content-between align-items-center px-5"
            >

                <Navbar.Brand onClick={goToMain}
                              style={{
                                  color: "black",
                                  fontWeight: "bold",
                                  fontSize: "24px",
                                  cursor: "pointer",
                                  userSelect: "none"
                              }}
                >
                    <Image src={logo} style={{cursor: "pointer"}}></Image>
                    ReFind
                </Navbar.Brand>

                <Nav className="ms-auto d-flex flex-row gap-2">
                    <Button onClick={goToRegistration} className={styles.register} style={{fontSize: "18px"}}>
                        Register
                    </Button>
                    <Button onClick={goToLogin} className={styles.login} style={{fontSize: "18px"}}>
                        Login
                    </Button>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default NavBar;

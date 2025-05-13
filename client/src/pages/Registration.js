import React, {useState} from "react";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import RegisterForm from "../components/RegisterForm/RegisterForm";
import {useNavigate} from "react-router-dom";

function Registration(props) {
    const navigate = useNavigate();
    const isLogin = props.isLogin;

    const goToMain = () =>{
        navigate('/');
    }
    return (
        <div>
            <NavBar></NavBar>
            {isLogin ? goToMain :
                (
                    <RegisterForm></RegisterForm>
                )
            }
            <Footer></Footer>
        </div>
    );
}

export default Registration;

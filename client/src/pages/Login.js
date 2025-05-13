import React, {useState} from "react";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import LoginForm from "../components/LoginForm/LoginForm";
import {useNavigate} from "react-router-dom";

function Registration(props) {
    const navigate = useNavigate();
    const isLogin = props.isLogin;

    const goToMain = () =>{
        navigate('/');
    }
    return (
        <div>
            {isLogin ? goToMain :
                (
                    <LoginForm></LoginForm>
                )
            }
        </div>
    );
}

export default Registration;

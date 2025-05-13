import React from "react";
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
            {isLogin ? goToMain :
                (
                    <RegisterForm></RegisterForm>
                )
            }
        </div>
    );
}

export default Registration;

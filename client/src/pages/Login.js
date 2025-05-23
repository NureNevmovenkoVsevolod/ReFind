import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";

function Login(props) {
  const navigate = useNavigate();
  const isLogin = props.isLogin;
  const setIsLogin = props.setIsLogin;
  const goToMain = () => {
    navigate("/");
  };
  return <div>{isLogin ? goToMain : <LoginForm setIsLogin={setIsLogin}></LoginForm>}</div>;
}

export default Login;

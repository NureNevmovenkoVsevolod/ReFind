import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";

function Login(props) {
  const navigate = useNavigate();
  const isLogin = props.isLogin;

  const goToMain = () => {
    navigate("/");
  };
  return <div>{isLogin ? goToMain : <LoginForm></LoginForm>}</div>;
}

export default Login;

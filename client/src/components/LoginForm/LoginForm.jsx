import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginForm.module.css";
import FormInput from "../FormInput/FormInput";
import * as Yup from "yup";

function LoginForm({ setIsLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email обов'язковий")
      .email("Введіть коректний email"),
    password: Yup.string()
      .required("Пароль обов'язковий")
      .min(6, "Пароль має містити мінімум 6 символів"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (errors.submit) {
      setErrors((prev) => ({
        ...prev,
        submit: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/login`, formData);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsLogin(true);

      if (response.data.user.role === 'admin') {
        navigate("/admin");
      } else if(response.data.user.role === 'moder'){
        navigate("/moder/advertisments");
      } else {
        navigate("/");
      }
    }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        // Обробка помилок валідації
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else if (error.response) {
        // Обробка помилок від сервера
        if (error.response.status === 404) {
          setErrors({
            submit: "Користувача з такою поштою не існує"
          });
        } else if (error.response.status === 401) {
          setErrors({
            submit: "Невірний пароль або пошта"
          });
        } else {
          setErrors({
            submit: error.response.data.message || "Помилка входу"
          });
        }
      } else {
        setErrors({
          submit: "Помилка сервера"
        });
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = process.env.REACT_APP_SERVER_URL+"/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = process.env.REACT_APP_SERVER_URL+"/auth/facebook";
  };

  return (
    <div className={styles.container}>
      <h2>Вхід</h2>
      {errors.submit && (
        <div className={styles.error}>{errors.submit}</div>
      )}
      <form onSubmit={handleSubmit}>
        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          error={errors.email}
        />
        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Пароль"
          error={errors.password}
        />
        <button type="submit">Увійти</button>
      </form>

      <div className={styles.social_signin}>
        <p>Увійти через:</p>
        <div className={styles.social_icons}>
          <img
            src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_"G"_logo.svg'
            alt="Google"
            onClick={handleGoogleLogin}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
            alt="Facebook"
            onClick={handleFacebookLogin}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./RegisterForm.module.css";
import FormInput from "../FormInput/FormInput";
import * as Yup from "yup";

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .required("Ім'я обов'язкове")
      .min(2, "Ім'я має містити мінімум 2 символи"),
    last_name: Yup.string()
      .required("Прізвище обов'язкове")
      .min(2, "Прізвище має містити мінімум 2 символи"),
    email: Yup.string()
      .required("Email обов'язковий")
      .email("Введіть коректний email"),
    password: Yup.string()
      .required("Пароль обов'язковий")
      .min(6, "Пароль має містити мінімум 6 символів")
      .matches(
        /^(?=.*[\S])(?=.*[\S])(?=.*\d)/,
        "Пароль має містити хоча б одну велику літеру, одну малу літеру та одну цифру"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Паролі не співпадають")
      .required("Підтвердження паролю обов'язкове"),
  });

  const validateField = async (name, value) => {
    try {
      await validationSchema.validateAt(name, { [name]: value });
      setErrors(prev => ({ ...prev, [name]: "" }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [name]: error.message }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await validationSchema.validate(formData, { abortEarly: false });

      const response = await axios.post(
          process.env.REACT_APP_SERVER_URL+"/auth/register",
        formData
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("Token збережено:", localStorage.getItem("token"));
        navigate("/");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else if (error.response) {
        if (error.response.status === 400) {
          setErrors({
            submit: "Користувач з таким email вже існує"
          });
        } else {
          setErrors({
            submit: error.response.data.message || "Помилка реєстрації"
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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Реєстрація</h2>
        {errors.submit && (
          <div className={styles.error}>{errors.submit}</div>
        )}
        <form onSubmit={handleSubmit}>
          <FormInput
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Ім'я"
            error={errors.first_name}
          />
          <FormInput
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Прізвище"
            error={errors.last_name}
          />
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
          <FormInput
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Підтвердження паролю"
            error={errors.confirmPassword}
          />
          <button type="submit">Зареєструватися</button>
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
    </div>
  );
}

export default RegisterForm;

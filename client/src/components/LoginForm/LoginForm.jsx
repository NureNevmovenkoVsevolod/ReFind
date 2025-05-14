import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginForm.module.css";
import FormInput from "../FormInput/FormInput";
import * as Yup from "yup";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Enter a valid email"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must contain at least 6 characters"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      await validationSchema.validate(formData, { abortEarly: false });

      const response = await axios.post(
        "http://localhost:5000/auth/login",
        formData
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        // Handle validation errors
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Handle API errors
        setErrors({
          submit: error.response?.data?.message || "Login failed",
        });
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/auth/facebook";
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      {errors.submit && <div className={styles.error}>{errors.submit}</div>}
      <form onSubmit={handleSubmit}>
        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-mail"
          error={errors.email}
        />
        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          error={errors.password}
        />
        <button type="submit">Login</button>
      </form>

      <div className={styles.social_signin}>
        <p>Log in with:</p>
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

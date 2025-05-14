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

  // Validation schema
  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "First name can only contain letters"),
    last_name: Yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Last name can only contain letters"),
    email: Yup.string()
      .required("Email is required")
      .email("Enter a valid email"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must contain at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
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
        "http://localhost:5000/auth/register",
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
          submit: error.response?.data?.message || "Registration failed",
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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Registration</h2>
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
          <FormInput
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            error={errors.confirmPassword}
          />
          <FormInput
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            error={errors.first_name}
          />
          <FormInput
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            error={errors.last_name}
          />
          <button type="submit">Register</button>
          {errors.submit && <p className={styles.error}>{errors.submit}</p>}
        </form>

        <div className={styles.social_signin}>
          <p>Sign in with:</p>
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

import React, { useState } from 'react';

import styles from './RegisterForm.module.css';
import FormInput from "../FormInput/FormInput";

function RegisterForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' }); // очищаємо помилку при зміні
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.includes('@')) {
            newErrors.email = 'Введіть коректну електронну пошту';
        }

        if (formData.password.length < 6) {
            newErrors.password = 'Пароль має містити щонайменше 6 символів';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Паролі не співпадають';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Дані відправлені:', formData);
            // відправлення даних або перехід на іншу сторінку
        }
    };

    return (
        <div className={styles.register_container}>
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
                <button type="submit">Register</button>
            </form>

            <div className={styles.social_signin}>
                <p>Sign in with:</p>
                <div className={styles.social_icons}>
                    <img
                        src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_"G"_logo.svg'
                        alt="Google"
                    />
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                        alt="Facebook"
                    />
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;

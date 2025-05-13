import React, { useState } from 'react';

import styles from './LoginForm.module.css';
import FormInput from "../FormInput/FormInput";

function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' }); // очищаємо помилку при зміні
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.includes('@')) {
            newErrors.email = 'Enter a valid email';
        }

        if (formData.password.length < 6) {
            newErrors.password = 'Password must contain at least 6 characters';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Data was sent:', formData);
            // відправлення даних або перехід на іншу сторінку
        }
    };

    return (
        <div className={styles.container}>
            <h2>Login</h2>
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

export default LoginForm;

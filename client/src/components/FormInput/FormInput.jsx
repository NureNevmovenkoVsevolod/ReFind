import React from 'react';
import styles from'./FormInput.module.css';

function FormInput({ type = 'text', name, value, onChange, placeholder, error }) {
    return (
        <div className={styles.form_group}>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${styles.form_input} ${error ? styles.input_error : ''}`}
                required
            />
            {error && <span className="error-text">{error}</span>}
        </div>
    );
}

export default FormInput;

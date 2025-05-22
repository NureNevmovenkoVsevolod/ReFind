import React from "react";
import styles from "./Loader.module.css";

const Loader = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.loader}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
            </div>
        </div>
    );
};

export default Loader;

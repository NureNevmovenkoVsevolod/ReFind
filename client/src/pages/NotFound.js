import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.glitchWrapper}>
                <h1 className={styles.glitch} data-text="404">404</h1>
                <p className={styles.message}>Page Not Found</p>
                <Link to="/" className={styles.button}>⬅ Back Home</Link>
            </div>
            <div className={styles.bg} />
        </div>
    );
};

export default NotFound;

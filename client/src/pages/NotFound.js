import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = ({isAdmin}) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.glitchWrapper}>
                <h1 className={styles.glitch} data-text="404">404</h1>
                <p className={styles.message}>Page Not Found</p>
                <Link to={isAdmin ? "/admin" : "/"} className={styles.button}>⬅ Back Home</Link>
            </div>
            <div className={styles.bg} />
        </div>
    );
};

export default NotFound;

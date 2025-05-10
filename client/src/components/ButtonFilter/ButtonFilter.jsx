import styles from './ButtonFilter.module.css'

function ButtonFilter({children, isActive, ...props}) {
    return (
        <button {...props} className={isActive ? `${styles.button} ${styles.active}`: styles.button} >{children}</button>
    );
}

export default ButtonFilter;
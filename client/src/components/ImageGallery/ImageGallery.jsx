import { useState } from "react";
import styles from "./ImageGallery.module.css";

const ImageGallery = ({ images }) => {
    const [current, setCurrent] = useState(0);

    const prevImage = () => {
        setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const selectImage = (index) => setCurrent(index);

    if (!images || images.length === 0) return null;

    return (
        <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
                <img
                    src={images[current]}
                    alt={`Image ${current + 1}`}
                    className={styles.mainImage}
                />
                {images.length > 1 && (
                    <>
                        <button className={styles.navButton} onClick={prevImage}>
                            {"<"}
                        </button>
                        <button className={styles.navButton} onClick={nextImage}>
                            {">"}
                        </button>
                    </>
                )}
            </div>
            {images.length > 1 && (
                <div className={styles.thumbnailRow}>
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            className={`${styles.thumbnail} ${
                                idx === current ? styles.active : ""
                            }`}
                            onClick={() => selectImage(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;

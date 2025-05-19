import React from "react";
import { Image } from "react-bootstrap";
import styles from "./FindCard.module.css";
import calendar from "../../assets/calendar.png";
import bgcard from "../../assets/photo.png";

function FindCard({ image, date, cityName, categoryName, title, description }) {
  const formatLocation = (location) => {
    if (!location) return "";
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length <= 4) return parts.join(", ");

    // Видаляємо перші 2 та останні 2 частини
    return parts.slice(2, -2).join(", ");
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageContainer}>
        {" "}
        <Image
          src={image || bgcard}
          alt="Found item"
          className={styles.image}
        />
        {date && (
          <div className={styles.dateLabel}>
            <Image
              src={calendar}
              alt="Calendar"
              className={styles.calendarIcon}
            />
            {date}
          </div>
        )}
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.infoContainer}>
          <div className={styles.cityContainer}>
            <span className={styles.cityName}>{formatLocation(cityName)}</span>
          </div>
          <div className={styles.categoryContainer}>
            <span className={styles.categoryName}>{categoryName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindCard;

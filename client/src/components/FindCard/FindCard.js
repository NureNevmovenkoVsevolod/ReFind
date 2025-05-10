import React from "react";
import { Image } from "react-bootstrap";
import styles from "./FindCard.module.css";
import calendar from "../../assets/calendar.png";

function FindCard({ image, date, cityName, categoryName }) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageContainer}>
        <Image
          src="../../assets/bgcard.png"
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
            <span className={styles.cityName}>{cityName}</span>
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

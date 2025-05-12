import React from "react";
import { Image, Row, Col } from "react-bootstrap";
import styles from "./LossCard.module.css";
import calendar from "../../assets/calendar.png";
import location from "../../assets/location.png";

function LossCard({ image, date, cityName, categoryName, name, description }) {
  return (
    <div className={styles.cardContainer}>
      <Row>
        <Col xs={12} md={3}>
          <div className={styles.imageContainer}>
            <Image
              src="../../assets/bgcard.png"
              alt="Lost item"
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
        </Col>
        <Col xs={12} md={9}>
          <div className={styles.contentContainer}>
            <h3 className={styles.itemName}>{name}</h3>
            <p className={styles.description}>{description}</p>
            <div className={styles.infoFooter}>
              <div className={styles.locationContainer}>
                <Image src={location} alt="Location_icon" />
                <span className={styles.cityName}>{cityName}</span>
              </div>
              <div className={styles.categoryBadge}>
                <span>{categoryName}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default LossCard;

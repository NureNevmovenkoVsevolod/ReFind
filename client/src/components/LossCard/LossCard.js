import React from "react";
import { Image, Row, Col } from "react-bootstrap";
import styles from "./LossCard.module.css";
import calendar from "../../assets/calendar.png";
import location from "../../assets/location.png";
import bgcard from "../../assets/photo.png";
import {Link} from "react-router-dom";
import {encodeId} from "../../utils/encodeId";

function LossCard({ advertisement_id, image, date, cityName, categoryName, title, description }) {
  const formatLocation = (location) => {
    if (!location) return "";
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length <= 4) return parts.join(", ");

    return parts.slice(1, -2).join(", ");
  };
  return (
    <Link to={`/advertisement/${encodeId(advertisement_id)}`} className={styles.cardContainer}>
      <Row>
        <Col xs={12} md={3}>
          <div className={styles.imageContainer}>
            <Image src={image || bgcard} alt="Lost item" className={styles.image} />
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
            <h3 className={styles.itemName}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <div className={styles.infoFooter}>
              <div className={styles.locationContainer}>
                <Image src={location} alt="Location_icon" />
                <span className={styles.cityName}>
                  {formatLocation(cityName)}
                </span>
              </div>
              <div className={styles.categoryBadge}>
                <span>{categoryName}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Link>
  );
}

export default LossCard;

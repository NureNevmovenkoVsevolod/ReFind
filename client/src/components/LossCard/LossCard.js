import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";
import styles from "./LossCard.module.css";
import calendar from "../../assets/calendar.png";
import location from "../../assets/location.png";
import bgcard from "../../assets/photo.png";
import { Link } from "react-router-dom";
import { encodeId } from "../../utils/encodeId";
import { getLanguage } from "../../utils/i18n";

function LossCard({ advertisement_id, image, date, cityName, cityCoords, categoryName, title, description }) {
  const [address, setAddress] = useState(cityName);

  useEffect(() => {
    let coords = cityCoords;
    if (!coords && cityName) {
      try {
        const parsed = JSON.parse(cityName);
        if (parsed && parsed.lat && parsed.lng) coords = parsed;
      } catch {}
    }
    if (!coords || !coords.lat || !coords.lng) {
      setAddress(cityName);
      return;
    }
    const lang = getLanguage();
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&accept-language=${lang}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name && data.display_name.trim() && data.display_name !== cityName) {
          setAddress(data.display_name);
        } else {
          setAddress(cityName);
        }
      })
      .catch(() => setAddress(cityName));
  }, [cityCoords, cityName, getLanguage()]);

  const formatLocation = (location) => {
    if (!location) return "";
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length <= 4) return parts.join(", ");
    return parts.slice(1, -2).join(", ");
  };

  return (
    <Link to={`/advertisement/${encodeId(advertisement_id)}`} className={styles.cardContainer}>
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
      <div className={styles.contentContainer}>
        <h3 className={styles.itemName}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.infoFooter}>
          <div className={styles.locationContainer}>
            <Image src={location} alt="Location_icon" />
            <span className={styles.cityName}>{formatLocation(address)}</span>
          </div>
          <div className={styles.categoryBadge}>
            <span>{categoryName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default LossCard;

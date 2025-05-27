import React from "react";
import { Image, Button } from "react-bootstrap";
import styles from "./LossCard.module.css";
import calendar from "../../assets/calendar.png";
import location from "../../assets/location.png";
import bgcard from "../../assets/photo.png";
import { encodeId } from "../../utils/encodeId";
import { useNavigate } from "react-router-dom";

function LossCardProfile({
  advertisement_id,
  image,
  date,
  cityName,
  categoryName,
  title,
  description,
  onEdit,
  onDelete,
  modCheck,
  status,
}) {
  const navigate = useNavigate();

  const getStatusStyle = () => {
    if (!modCheck) {
      return { color: "#FF8C00" };
    }
    if (status === "rejected") {
      return { color: "#FF0000" };
    }
    if (status === "active" && modCheck) {
      return { color: "#008000" };
    }
    return {};
  };

  const getStatusText = () => {
    if (!modCheck) {
      return "Оголошення на модерації";
    }
    if (status === "rejected") {
      return "Відхилено модерацією";
    }
    if (status === "active" && modCheck) {
      return "Оголошення активне";
    }
    return "";
  };

  const formatLocation = (location) => {
    if (!location) return "";
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length <= 4) return parts.join(", ");
    return parts.slice(1, -2).join(", ");
  };

  const handleCardClick = (e) => {
    // Prevent navigation if edit/delete button was clicked
    if (e.target.closest("button")) return;
    navigate(`/advertisement/${encodeId(advertisement_id)}`);
  };

  return (
    <div
      className={styles.cardContainer}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className={styles.itemName}>{title}</h3>
          <div>
            <Button
              variant="link"
              style={{ fontSize: 22 }}
              onClick={onEdit}
              title="Редагувати"
            >
              ✏️
            </Button>
            <Button
              variant="link"
              style={{ fontSize: 22 }}
              onClick={onDelete}
              title="Видалити"
            >
              🗑️
            </Button>
          </div>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.infoFooter}>
          <div className={styles.locationContainer}>
            <Image src={location} alt="Location_icon" />
            <span className={styles.cityName}>{formatLocation(cityName)}</span>
          </div>
          <div className={styles.categoryBadge}>
            <span>{categoryName}</span>
          </div>
        </div>
        <div
          style={{ marginTop: "10px", fontWeight: "bold", ...getStatusStyle() }}
        >
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}

export default LossCardProfile;

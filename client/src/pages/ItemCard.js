import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { decodeId } from "../utils/encodeId";
import styles from "./ItemCard.module.css";
import { Marker, Popup, TileLayer } from "react-leaflet";
import Map from "../components/Map/Map";
import ImageGallery from "../components/ImageGallery/ImageGallery";
import SuccessModal from "../components/Modal/SuccessModal";
import NotFound from "./NotFound";
import Loader from "../components/Loader/Loader";
import axios from "axios";

function ItemCard({ isLogin, isModerator }) {
  const { id: encodedId } = useParams();
  const [ad, setAd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [moderationStatus, setModerationStatus] = useState(null);

  const handleModeration = async (approved) => {
    try {
      const decodedId = decodeId(encodedId);
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/advertisement/${decodedId}/moderate`,
        { approved },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setModerationStatus(approved ? "approved" : "rejected");

      setAd((prev) => ({
        ...prev,
        mod_check: approved,
        status: approved ? "active" : "rejected",
      }));
    } catch (error) {
      console.error("Помилка при модерації:", error);
      setError("Помилка при модерації оголошення");
    }
  };

  useEffect(() => {
    let decodedId;
    try {
      decodedId = decodeId(encodedId);
    } catch {
      setError("Incorrect id.");
      return;
    }

    fetch(`${process.env.REACT_APP_SERVER_URL}/api/advertisement/${decodedId}`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = (await res.json()).message || setError("Loading error.");
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setAd)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [encodedId]);

  const navigate = useNavigate();
  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (error)
    return (
      <>
        <SuccessModal
          show={showModal}
          handleClose={handleCloseModal}
          message={"Advertisement was not found.\n" + `Reason: ${error}`}
        ></SuccessModal>
        <NotFound />
      </>
    );
  if (loading) return <Loader />;

  const {
    Images,
    categorie_id,
    createdAt,
    description,
    email,
    incident_date,
    location_description,
    mod_check,
    phone,
    reward,
    status,
    title,
    type,
    updatedAt,
    user_id,
  } = ad;

  let location_coordinates;
  try {
    location_coordinates = JSON.parse(ad.location_coordinates);
  } catch {
    location_coordinates = ad.location_coordinates;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <span>←</span> Back
      </button>

      <div className={styles.main}>
        <ImageGallery images={Images?.map((img) => `${img.image_url}`)} />

        <div className={styles.contentSection}>
          <div className={styles.zagolovok}>
            {type == "find"
              ? `Found item description`
              : `Lost item description`}
          </div>
          <h1>{title}</h1>
          <div className={styles.info}>
            <p>📅 {new Date(incident_date).toLocaleDateString()}</p>
            <p>📍 {location_description}</p>
            {Number.parseFloat(reward) === 0.0 ? (
              ""
            ) : (
              <p>💰 Reward: {reward}₴</p>
            )}
          </div>
          <p className={styles.shortDesc}>{description}</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.contacts}>
          <h3>Contact details for communication:</h3>
          <p>📞 {phone}</p>
          {email ? <p>📧 {email}</p> : ""}
          {isLogin && !isModerator ? (
            <>
              <button className={styles.messageBtn}>Send a message</button>
              <p className={styles.favorite}>Favorite category 🤍</p>
            </>
          ) : (
            <></>
          )}
          {isModerator && !mod_check && (
            <div className={styles.moderationButtons}>
              <button
                className={`${styles.modButton} ${styles.approveButton}`}
                onClick={() => handleModeration(true)}
                disabled={moderationStatus !== null}
              >
                Схвалити
              </button>
              <button
                className={`${styles.modButton} ${styles.rejectButton}`}
                onClick={() => handleModeration(false)}
                disabled={moderationStatus !== null}
              >
                Відхилити
              </button>
            </div>
          )}
          {moderationStatus && (
            <p className={styles.moderationStatus}>
              {moderationStatus === "approved"
                ? "Оголошення схвалено"
                : "Оголошення відхилено"}
            </p>
          )}
        </div>

        <div className={styles.mapWrapper}>
          <h3>Location</h3>
          <Map
            initialCoordinates={{
              lat: location_coordinates?.lat || 0,
              lng: location_coordinates?.lng || 0,
            }}
            readOnly={true}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[
                location_coordinates?.lat || 0,
                location_coordinates?.lng || 0,
              ]}
            >
              <Popup>{title}</Popup>
            </Marker>
          </Map>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;

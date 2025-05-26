import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [moderationStatus, setModerationStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  const navigate = useNavigate();

  // Memoized decodeId
  const decodedId = useMemo(() => {
    try {
      return decodeId(encodedId);
    } catch {
      setError("Incorrect id.");
      return null;
    }
  }, [encodedId]);

  // Fetch ad
  useEffect(() => {
    if (!decodedId) return;
    setLoading(true);
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/advertisement/${decodedId}`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = (await res.json()).message || "Loading error.";
          throw new Error(msg);
        }
        return res.json();
      })
      .then(setAd)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedId]);

  // Fetch favorite status (after ad loaded)
  useEffect(() => {
    if (!isLogin || !ad?.categorie_id) return;
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/api/user/favorite-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const favs = res.data || [];
        setIsFavorite(favs.some((cat) => cat.categorie_id === ad.categorie_id));
      })
      .catch(() => setIsFavorite(false));
  }, [isLogin, ad?.categorie_id]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleModeration = useCallback(
    async (approved) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${process.env.REACT_APP_SERVER_URL}/api/advertisement/${decodedId}/moderate`,
          { approved },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModerationStatus(approved ? "approved" : "rejected");
        setAd((prev) => ({
          ...prev,
          mod_check: approved,
          status: approved ? "active" : "rejected",
        }));
      } catch (error) {
        setError("Помилка при модерації оголошення");
      }
    },
    [decodedId]
  );

  const handleFavoriteClick = useCallback(async () => {
    if (!isLogin || favoriteLoading || !ad?.categorie_id) return;
    setFavoriteLoading(true);
    setFavoriteError("");
    const token = localStorage.getItem("token");
    try {
      if (!isFavorite) {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-category`,
          { categorie_id: ad.categorie_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      } else {
        await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-category`,
          { data: { categorie_id: ad.categorie_id }, headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(false);
      }
      // Re-fetch favorite to sync state
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const favs = res.data || [];
        setIsFavorite(favs.some((cat) => cat.categorie_id === ad.categorie_id));
      } catch {}
    } catch (e) {
      setFavoriteError(
        "Виникла помилка при додаванні в обране. Спробуйте ще раз або зверніться до підтримки."
      );
    } finally {
      setFavoriteLoading(false);
    }
  }, [isLogin, favoriteLoading, ad?.categorie_id, isFavorite]);

  // Memoized ad fields
  const images = useMemo(() => ad?.Images?.map((img) => `${img.image_url}`) || [], [ad]);
  const locationCoordinates = useMemo(() => {
    if (!ad?.location_coordinates) return { lat: 0, lng: 0 };
    try {
      const coords = typeof ad.location_coordinates === "string"
        ? JSON.parse(ad.location_coordinates)
        : ad.location_coordinates;
      return {
        lat: coords?.lat || 0,
        lng: coords?.lng || 0,
      };
    } catch {
      return { lat: 0, lng: 0 };
    }
  }, [ad]);
  const formattedDate = useMemo(() => ad?.incident_date ? new Date(ad.incident_date).toLocaleDateString() : '', [ad]);

  if (error)
    return (
      <>
        <SuccessModal
          show={showModal}
          handleClose={handleCloseModal}
          message={`Advertisement was not found.\nReason: ${error}`}
        />
        <NotFound />
      </>
    );
  if (loading || !ad) return <Loader />;

  return (
    <div className="centerContent">
      <div className={styles.container}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <span>←</span> Back
        </button>

        <div className={styles.main}>
          <ImageGallery images={images} />

          <div className={styles.contentSection}>
            <div className={styles.zagolovok}>
              {ad.type === "find" ? `Found item description` : `Lost item description`}
            </div>
            <h1>{ad.title}</h1>
            <div className={styles.info}>
              <p>📅 {formattedDate}</p>
              <p>📍 {ad.location_description}</p>
              {Number.parseFloat(ad.reward) === 0.0 ? null : <p>💰 Reward: {ad.reward}₴</p>}
            </div>
            <p className={styles.shortDesc}>{ad.description}</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.contacts}>
            <h3>Contact details for communication:</h3>
            <p>📞 {ad.phone}</p>
            {ad.email ? <p>📧 {ad.email}</p> : null}
            {isLogin && !isModerator ? (
              <>
                <button className={styles.messageBtn}>Send a message</button>
                <button
                  className={styles.favorite}
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  style={{ background: 'none', border: 'none', cursor: isLogin ? 'pointer' : 'not-allowed', fontSize: 22 }}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                {isFavorite && (
                  <div className={styles.favoriteMsg}>Категорію додано в обране</div>
                )}
                {favoriteError && (
                  <div className={styles.favoriteError}>{favoriteError}</div>
                )}
              </>
            ) : (
              <button
                className={styles.favorite}
                aria-label="Login to add to favorites"
                style={{ background: 'none', border: 'none', cursor: 'not-allowed', fontSize: 22 }}
                disabled
              >
                🤍
              </button>
            )}
            {ad.User && (
              <div className={styles.userInfoBlock}>
                <div className={styles.userAvatarWrapper}>
                  <img
                    src={ad.User.user_pfp || require('../assets/user.png')}
                    alt={ad.User.first_name || 'User'}
                    className={styles.userAvatar}
                  />
                </div>
                <div className={styles.userName}>{ad.User.first_name || 'User'}</div>
              </div>
            )}
            {isModerator && !ad.mod_check && (
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
              initialCoordinates={locationCoordinates}
              readOnly={true}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[locationCoordinates.lat, locationCoordinates.lng]}
              >
                <Popup>{ad.title}</Popup>
              </Marker>
            </Map>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCard;

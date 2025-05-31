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
import Toast from "../components/Toast/Toast";
import { t, getLanguage } from "../utils/i18n";
import ComplaintModal from "../components/Modal/ComplaintModal";
import reportFlag from '../assets/report-flag.svg';

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
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [address, setAddress] = useState("");
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
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
        if (!res.ok) throw new Error((await res.json()).message || "Loading error.");
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

  // Address localization
  useEffect(() => {
    if (!ad?.location_coordinates) {
      setAddress(ad?.location_description || "");
      return;
    }
    let coords = ad.location_coordinates;
    if (typeof coords === "string") {
      try { coords = JSON.parse(coords); } catch { coords = null; }
    }
    if (!coords || !coords.lat || !coords.lng) {
      setAddress(ad?.location_description || "");
      return;
    }
    const lang = getLanguage();
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&accept-language=${lang}`)
      .then(res => res.json())
      .then(data => setAddress(data.display_name || ad.location_description))
      .catch(() => setAddress(ad.location_description));
  }, [ad?.location_coordinates, getLanguage()]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleModeration = useCallback(async (approved) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/advertisement/${decodedId}/moderate`,
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModerationStatus(approved ? "approved" : "rejected");
      setAd((prev) => ({ ...prev, mod_check: approved, status: approved ? "active" : "rejected" }));
    } catch {
      setError("Помилка при модерації оголошення");
    }
  }, [decodedId]);

  const handleFavoriteClick = useCallback(async () => {
    if (!isLogin || favoriteLoading || !ad?.categorie_id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setFavoriteError("Ви не авторизовані. Увійдіть у систему.");
      return;
    }
    setFavoriteLoading(true);
    setFavoriteError("");
    try {
      if (!isFavorite) {
        await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-category`,
          { categorie_id: Number(ad.categorie_id) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
        setToastMsg(t('toast.categoryAdded', { category: ad.categorie_name }));
        setShowToast(true);
      } else {
        await axios.delete(
          `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-category`,
          { data: { categorie_id: Number(ad.categorie_id) }, headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(false);
      }
      // Re-fetch favorite to sync state
      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/user/favorite-categories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const favs = res.data || [];
      setIsFavorite(favs.some((cat) => cat.categorie_id === ad.categorie_id));
    } catch {
      setFavoriteError("Виникла помилка при додаванні в обране. Спробуйте ще раз або зверніться до підтримки.");
    } finally {
      setFavoriteLoading(false);
    }
  }, [isLogin, favoriteLoading, ad?.categorie_id, isFavorite]);

  const handleComplaintSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/complaints`,
        {
          advertisement_id: decodedId,
          complaints_text: formData.description,
          title: formData.title
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowComplaintModal(false);
      setComplaintSuccess(true);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Помилка при відправці скарги");
    }
  };

  const handleWriteMessage = async () => {
    if (!ad?.user_id || !ad?.advertisement_id) {
      alert('Не вдалося визначити користувача або оголошення для чату');
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (ad.user_id === currentUser?.id) {
      alert('Ви не можете почати чат із самим собою!');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      // 1. Отримати всі чати користувача
      const res = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const chats = res.data || [];
      // 2. Перевірити, чи є вже чат з цим user_id_2 та цим оголошенням
      const existingChat = chats.find(chat => {
        const user1 = chat.User1?.user_id;
        const user2 = chat.User2?.user_id;
        return (
          ((user1 === ad.user_id && user2 === currentUser.id) ||
          (user2 === ad.user_id && user1 === currentUser.id)) &&
          chat.advertisement_id === ad.advertisement_id
        );
      });
      if (existingChat) {
        navigate(`/chat?user=${ad.user_id}&ad=${ad.advertisement_id}`);
        return;
      }
      // 3. Якщо чату немає — створити
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/chat`,
        {
          user_id_2: ad.user_id,
          advertisement_id: ad.advertisement_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat?user=${ad.user_id}&ad=${ad.advertisement_id}`);
    } catch (e) {
      alert('Не вдалося створити чат: ' + (e?.response?.data?.message || e.message));
    }
  };

  // Memoized ad fields
  const images = useMemo(() => ad?.Images?.map((img) => `${img.image_url}`) || [], [ad]);
  const locationCoordinates = useMemo(() => {
    if (!ad?.location_coordinates) return { lat: 0, lng: 0 };
    try {
      const coords = typeof ad.location_coordinates === "string" ? JSON.parse(ad.location_coordinates) : ad.location_coordinates;
      return { lat: coords?.lat || 0, lng: coords?.lng || 0 };
    } catch { return { lat: 0, lng: 0 }; }
  }, [ad]);
  const formattedDate = useMemo(() => ad?.incident_date ? new Date(ad.incident_date).toLocaleDateString() : "", [ad]);

  if (error)
    return (
      <>
        <SuccessModal show={showModal} handleClose={handleCloseModal} message={`Advertisement was not found.\nReason: ${error}`} />
        <NotFound />
      </>
    );
  if (loading || !ad) return <Loader />;

  // Category + Favorite button block
  const CategoryFavorite = () => (
    <div className={styles.categoryFavoriteRow}>
      <span className={styles.categoryBadge}>{ad.categorie_name}</span>
      <button
        className={styles.favorite}
        onClick={isLogin && !isModerator ? handleFavoriteClick : undefined}
        disabled={favoriteLoading || !isLogin || isModerator}
        aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
        style={{ background: "none", border: "none", cursor: isLogin && !isModerator ? "pointer" : "not-allowed", fontSize: 22, marginLeft: 10 }}
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>
    </div>
  );

  return (
    <div className="centerContent">
      <div className={styles.container}>
        <Toast show={showToast} onClose={() => setShowToast(false)}>{toastMsg}</Toast>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <span>←</span> Back
        </button>
        <div className={styles.main}>
          <ImageGallery images={images} />
          <div className={styles.contentSection}>
            <div className={styles.zagolovok}>{ad.type === "find" ? `Found item description` : `Lost item description`}</div>
            <h1>{ad.title}</h1>
            <div className={styles.info}>
              <p>📅 {formattedDate}</p>
              <p>📍 {address}</p>
              {Number.parseFloat(ad.reward) === 0.0 ? null : <p>💰 Reward: {ad.reward}₴</p>}
            </div>
            <p className={styles.shortDesc}>{ad.description}</p>
            <CategoryFavorite />
            {favoriteError && <div className={styles.favoriteError}>{favoriteError}</div>}
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.contacts}>
            {ad.User && (
              <div className={styles.userInfoBlock}>
                <div className={styles.userAvatarWrapper}>
                  <img src={ad.User.user_pfp || require("../assets/user.png")}
                    alt={ad.User.first_name || "User"}
                    className={styles.userAvatar}
                  />
                </div>
                <div className={styles.userName}>{ad.User.first_name || "User"}</div>
                {isLogin && !isModerator && (() => {
                  const currentUser = JSON.parse(localStorage.getItem('user'));
                  if (ad.User.user_id === currentUser?.id) return null;
                  return (
                    <img
                      src={reportFlag}
                      alt="Поскаржитись"
                      title="Поскаржитись"
                      style={{ width: 28, height: 28, marginLeft: 10, cursor: 'pointer', filter: 'invert(18%) sepia(99%) saturate(7482%) hue-rotate(357deg) brightness(97%) contrast(119%)' }}
                      onClick={() => setShowComplaintModal(true)}
                    />
                  );
                })()}
              </div>
            )}
            {(() => {
              const currentUser = JSON.parse(localStorage.getItem('user'));
              if (ad?.user_id && currentUser?.id && ad.user_id === currentUser.id) {
                return null;
              }
              return (
                <button
                  className={styles.messageBtn}
                  onClick={handleWriteMessage}
                >
                  Написати повідомлення
                </button>
              );
            })()}
            {isModerator && !ad.mod_check && (
              <div className={styles.moderationButtons}>
                <button className={`${styles.modButton} ${styles.approveButton}`} onClick={() => handleModeration(true)} disabled={moderationStatus !== null}>Схвалити</button>
                <button className={`${styles.modButton} ${styles.rejectButton}`} onClick={() => handleModeration(false)} disabled={moderationStatus !== null}>Відхилити</button>
              </div>
            )}
            {moderationStatus && (
              <p className={styles.moderationStatus}>
                {moderationStatus === "approved" ? "Оголошення схвалено" : "Оголошення відхилено"}
              </p>
            )}
          </div>
          <div className={styles.mapWrapper}>
            <h3>Location</h3>
            <Map initialCoordinates={locationCoordinates} readOnly={true}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[locationCoordinates.lat, locationCoordinates.lng]}>
                <Popup>{ad.title}</Popup>
              </Marker>
            </Map>
          </div>
        </div>
      </div>

      <ComplaintModal
        show={showComplaintModal}
        handleClose={() => setShowComplaintModal(false)}
        onSubmit={handleComplaintSubmit}
        advertisementTitle={ad?.title}
      />

      <SuccessModal
        show={showSuccessModal}
        handleClose={() => setShowSuccessModal(false)}
        message={`Дякуємо, що повідомили нас про проблему з оголошенням "${ad?.title}". Ми отримали вашу скаргу та розпочали її перевірку.`}
      />
    </div>
  );
}

export default ItemCard;

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

function ItemCard({ isLogin }) {
  const { id: encodedId } = useParams();
  const [ad, setAd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(true);
  useEffect(() => {
    let decodedId;
    try {
      decodedId = decodeId(encodedId);
    } catch {
      setError("Incorrect id.");
      return;
    }

    fetch(`http://localhost:5000/api/advertisement/${decodedId}`)
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
      <div className={styles.breadcrumb}>Home / Card description</div>

      <div className={styles.main}>
        <ImageGallery
          images={Images?.map(
            (img) => `http://localhost:5000/static${img.image_url}`
          )}
        />

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
            {Number.parseFloat(reward) === 0.0 ? "" : <p>💰 Reward: {reward}₴</p>}
          </div>
          <p className={styles.shortDesc}>{description}</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.contacts}>
          <h3>Contact details for communication:</h3>
          <p>📞 {phone}</p>
          {email ? <p>📧 {email}</p> : ""}
          {isLogin ? (
            <>
              <button className={styles.messageBtn}>Send a message</button>
              <p className={styles.favorite}>Favorite category 🤍</p>
            </>
          ) : (
            <></>
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

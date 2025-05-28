import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./UserProfile.module.css";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/user.png";
import LossCardProfile from "../components/LossCard/LossCardProfile";
import { validateText } from "../utils/textModeration";
import axios from "axios";
import CreateAdvertForm from "../components/CreateAdvertForm/CreateAdvertForm";
import SuccessModal from "../components/Modal/SuccessModal";
import EditAdvertForm from "../components/EditAdvertForm/EditAdvertForm";
import Loader from "../components/Loader/Loader";

const getUserFromStorage = () => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef();
  const saveTimeoutRef = useRef(null);
  const [userData, setUserData] = useState(getUserFromStorage);
  const [editAd, setEditAd] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [deleteAd, setDeleteAd] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setAvatar(userData?.user_pfp || userIcon);
    setNickname(userData?.first_name || "");
    setLastName(userData?.last_name || "");
    setEmail(userData?.email || "");
    setPhoneNumber(userData?.phone_number || "");
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [adsRes, favRes] = await Promise.all([
          axios.get(process.env.REACT_APP_SERVER_URL + "/api/advertisement/user/my", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(process.env.REACT_APP_SERVER_URL + "/api/user/favorite-categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAnnouncements(adsRes.data || []);
        setFavoriteCategories(favRes.data || []);
      } catch {
        setAnnouncements([]);
        setFavoriteCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateProfile = async (fields) => {
    try {
      const token = localStorage.getItem("token");
      const userId = userData.user_id ?? userData.id;
      const updatedFields = {
        first_name: fields.first_name ?? nickname,
        last_name: fields.last_name ?? lastName,
        email: fields.email ?? email,
        user_pfp: fields.user_pfp ?? userData.user_pfp,
        phone_number: fields.phone_number ?? phoneNumber,
        password: fields.password || undefined,
        is_blocked: userData.is_blocked ?? false,
        blocked_until: userData.blocked_until ?? null,
      };
      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/user/${userId}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      setUserData(res.data);
      setAvatar(res.data.user_pfp || userIcon);
      setNickname(res.data.first_name || "");
      setLastName(res.data.last_name || "");
      setEmail(res.data.email || "");
      setPhoneNumber(res.data.phone_number || "");
      return true;
    } catch {
      setNicknameError("Failed to update profile");
      return false;
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        process.env.REACT_APP_SERVER_URL + "/api/upload/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await updateProfile({ user_pfp: res.data.avatarUrl });
    } catch {
      setAvatarError("Помилка завантаження аватара");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEditProfile = () => {
    setNickname(userData?.first_name || "");
    setLastName(userData?.last_name || "");
    setEmail(userData?.email || "");
    setPhoneNumber(userData?.phone_number || "");
    setPassword("");
    setShowProfileEditModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileEditModal(false);
    setNicknameError("");
    setIsEditingName(false);
  };

  const handleNicknameChange = (e) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    setNicknameError("");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (newNickname) {
        setIsValidating(true);
        const validation = await validateText(newNickname);
        setIsValidating(false);
        if (!validation.isValid) setNicknameError(validation.error);
      }
    }, 500);
  };

  const handleSaveProfile = async () => {
    if (nicknameError || !nickname.trim()) return;
    await updateProfile({
      first_name: nickname,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      password: password || undefined,
    });
    handleCloseModal();
  };

  const handleDeleteAd = async () => {
    if (!deleteAd) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        process.env.REACT_APP_SERVER_URL + `/api/advertisement/${deleteAd.advertisement_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements((prev) => prev.filter((ad) => ad.advertisement_id !== deleteAd.advertisement_id));
      setSuccessMessage("Оголошення успішно видалено!");
    } catch {
      setSuccessMessage("Помилка при видаленні оголошення");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteAd(null);
    }
  };

  const handleAdEditSuccess = async (updatedAd) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        process.env.REACT_APP_SERVER_URL + "/api/advertisement/user/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements(res.data || []);
    } catch {
      setAnnouncements((prev) => prev.map((ad) => ad.advertisement_id === updatedAd.advertisement_id ? updatedAd : ad));
    } finally {
      setLoading(false);
      setShowEditModal(false);
      setEditAd(null);
      setSuccessMessage("Оголошення оновлено!");
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContent}>
        <Button variant="link" className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className={styles.profileCard}>
          <div className={styles.avatarBigBlock}>
            <Image src={avatar} className={styles.avatarBig} alt="avatar" />
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleAvatarChange} disabled={avatarUploading} />
            {avatarError && <div style={{ color: "red", fontSize: 12 }}>{avatarError}</div>}
            <Button variant="outline-secondary" className={styles.editBtnUnderAvatar} onClick={handleEditProfile}>
              Edit profile
            </Button>
          </div>
          <div className={styles.profileMainInfo}>
            <div className={styles.nameRow}>
              <span className={styles.profileName}>{nickname}</span>
              <span className={styles.profileLastName}>{lastName}</span>
            </div>
            <div className={styles.profileEmail}>{email}</div>
            <div className={styles.ratingBlock}>
              <span className={styles.ratingStar}>★</span>
              <span className={styles.ratingValue}>4.5/5</span>
            </div>
            <div className={styles.favoritesBlock}>
              <h4>Обрані категорії:</h4>
              {favoriteCategories.length === 0 ? (
                <span className={styles.noFavorites}>Немає обраних категорій</span>
              ) : (
                <div className={styles.favoritesList}>
                  {favoriteCategories.map((cat) => (
                    <span key={cat.categorie_id} className={styles.favoriteBadge}>
                      {cat.categorie_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <h2 className={styles.announcementsTitle}>Мої оголошення</h2>
        <div className={styles.announcementsList}>
          {loading ? (
            <Loader />
          ) : announcements.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", width: "100%" }}>
              У вас ще немає оголошень.
            </div>
          ) : (
            announcements.map((item) => (
              <LossCardProfile
                key={item.advertisement_id}
                advertisement_id={item.advertisement_id}
                image={item.Images?.[0]?.image_url ? item.Images[0].image_url + '?t=' + Date.now() : undefined}
                date={item.incident_date ? new Date(item.incident_date).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                title={item.title}
                description={item.description}
                cityName={item.location_description}
                cityCoords={item.location_coordinates ? (typeof item.location_coordinates === 'string' ? JSON.parse(item.location_coordinates) : item.location_coordinates) : undefined}
                categoryName={item.Category?.categorie_name || "Other"}
                onEdit={() => { setEditAd(item); setShowEditModal(true); }}
                onDelete={() => { setDeleteAd(item); setShowDeleteModal(true); }}
                modCheck={item.mod_check}
                status={item.status}
              />
            ))
          )}
        </div>
      </div>

      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditAd(null); }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Редагувати оголошення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAd && editAd.mod_check === false ? (
            <div style={{ color: 'red', fontWeight: 500, fontSize: 18, textAlign: 'center', padding: '30px 0' }}>
              Це оголошення знаходиться на модерації і не може бути відредаговане.
            </div>
          ) : (
            editAd && (
              <EditAdvertForm
                key={JSON.stringify(editAd)}
                type={editAd.type}
                initialData={editAd}
                onSuccess={handleAdEditSuccess}
                onCancel={() => { setShowEditModal(false); setEditAd(null); }}
                isEdit
              />
            )
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setDeleteAd(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Підтвердіть видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>Ви дійсно хочете видалити це оголошення?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteAd(null); }}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={handleDeleteAd} disabled={deleteLoading}>
            {deleteLoading ? "Видалення..." : "Видалити"}
          </Button>
        </Modal.Footer>
      </Modal>

      <SuccessModal show={!!successMessage} handleClose={() => setSuccessMessage("")} message={successMessage} />

      <Modal show={showProfileEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className={styles.avatarEditBlock}>
              <Image src={avatar} className={styles.avatarPreview} alt="avatar" />
              <Button variant="outline-secondary" size="sm" onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={avatarUploading}>
                {avatarUploading ? "Uploading..." : "Change photo"}
              </Button>
            </div>
            {avatarError && <div className="text-danger mb-3">{avatarError}</div>}
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" value={nickname} onChange={handleNicknameChange} isInvalid={!!nicknameError} disabled={isValidating} />
              <Form.Control.Feedback type="invalid">{nicknameError}</Form.Control.Feedback>
              {isValidating && <div className="text-muted mt-1">Checking nickname...</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveProfile} disabled={isEditingName ? !!nicknameError || isValidating || !nickname.trim() : false}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;

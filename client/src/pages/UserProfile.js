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
  const [userData, setUserData] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });
  const [editAd, setEditAd] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [deleteAd, setDeleteAd] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [favoriteCategories, setFavoriteCategories] = useState([]);

  useEffect(() => {
    setAvatar(userData?.user_pfp || userIcon);
  }, [userData]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/api/advertisement/user/my",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnnouncements(res.data || []);
      } catch (e) {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
    // Fetch favorite categories
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/api/user/favorite-categories",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteCategories(res.data || []);
      } catch (e) {
        setFavoriteCategories([]);
      }
    };
    fetchFavorites();
  }, []);

  const updateProfile = async (newFields) => {
    try {
      const token = localStorage.getItem("token");
      const userId = userData.user_id ?? userData.id;
      const updatedFields = {
        first_name: newFields.first_name ?? userData.first_name,
        last_name: userData.last_name ?? "",
        email: userData.email ?? "",
        user_pfp: newFields.user_pfp ?? userData.user_pfp,
        phone_number: userData.phone_number ?? "",
        is_blocked: userData.is_blocked ?? false,
        blocked_until: userData.blocked_until ?? null,
      };
      console.log("PUT /api/user/", userId, updatedFields);
      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/user/${userId}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("PUT response:", res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUserData(res.data);
      setAvatar(res.data.user_pfp || userIcon);
      setNickname(res.data.first_name || "");
      return true;
    } catch (err) {
      setNicknameError("Failed to update profile");
      console.error("PUT error:", err, err?.response?.data);
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
      // Оновлюємо профіль з новим user_pfp
      await updateProfile({ user_pfp: res.data.avatarUrl });
    } catch (err) {
      setAvatarError("Помилка завантаження аватара");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEditProfile = () => {
    setNickname(userData?.first_name || "");
    setShowProfileEditModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileEditModal(false);
    setNicknameError("");
    setIsEditingName(false);
  };

  const handleNicknameChange = async (e) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    setNicknameError("");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      if (newNickname) {
        setIsValidating(true);
        const validation = await validateText(newNickname);
        setIsValidating(false);
        if (!validation.isValid) {
          setNicknameError(validation.error);
        }
      }
    }, 500);
  };

  const handleSaveProfile = async () => {
    if (nicknameError || !nickname.trim()) {
      return;
    }
    await updateProfile({ first_name: nickname });
    handleCloseModal();
  };

  const username =
    userData?.first_name + " " + userData?.last_name || "Username";

  // Видалення оголошення
  const handleDeleteAd = async () => {
    if (!deleteAd) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        process.env.REACT_APP_SERVER_URL +
          `/api/advertisement/${deleteAd.advertisement_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements((prev) =>
        prev.filter((ad) => ad.advertisement_id !== deleteAd.advertisement_id)
      );
      setSuccessMessage("Оголошення успішно видалено!");
    } catch (e) {
      setSuccessMessage("Помилка при видаленні оголошення");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteAd(null);
    }
  };

  // Оновлення оголошення після редагування
  const handleAdEditSuccess = async (updatedAd) => {
    // Після оновлення робимо повторний запит до бекенду для актуального списку з фото
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        process.env.REACT_APP_SERVER_URL + "/api/advertisement/user/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements(res.data || []);
    } catch (e) {
      // fallback: оновлюємо тільки одне оголошення
      setAnnouncements((prev) =>
        prev.map((ad) =>
          ad.advertisement_id === updatedAd.advertisement_id ? updatedAd : ad
        )
      );
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
        <Button
          variant="link"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
        <h1 className={styles.username}>{username}</h1>
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
        <div className={styles.profileTop}>
          <div className={styles.avatarBlock}>
            <div>
              <Image src={avatar} className={styles.avatar} alt="avatar" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
            {avatarError && (
              <div style={{ color: "red", fontSize: 12 }}>{avatarError}</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <Button
              variant="outline-secondary"
              className={styles.editBtn}
              onClick={handleEditProfile}
            >
              Edit profile
            </Button>
            <div className={styles.ratingBlock}>
              <div className={styles.ratingTitle}>Your rating:</div>
              <div className={styles.ratingValue}>4.5/5 ☆</div>
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
                date={
                  item.incident_date
                    ? new Date(item.incident_date).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""
                }
                title={item.title}
                description={item.description}
                cityName={item.location_description}
                categoryName={item.Category?.categorie_name || "Other"}
                onEdit={() => {
                  setEditAd(item);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setDeleteAd(item);
                  setShowDeleteModal(true);
                }}
                modCheck={item.mod_check}
                status={item.status}
              />
            ))
          )}
        </div>
      </div>

      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditAd(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Редагувати оголошення</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAd && (
            <EditAdvertForm
              key={JSON.stringify(editAd)}
              type={editAd.type}
              initialData={editAd}
              onSuccess={(updatedAd) => {
                console.log("EditAdvertForm onSuccess", updatedAd);
                handleAdEditSuccess(updatedAd);
              }}
              onCancel={() => {
                console.log("EditAdvertForm canceled");
                setShowEditModal(false);
                setEditAd(null);
              }}
              isEdit
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeleteAd(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Підтвердіть видалення</Modal.Title>
        </Modal.Header>
        <Modal.Body>Ви дійсно хочете видалити це оголошення?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteAd(null);
            }}
          >
            Скасувати
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAd}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Видалення..." : "Видалити"}
          </Button>
        </Modal.Footer>
      </Modal>

      <SuccessModal
        show={!!successMessage}
        handleClose={() => setSuccessMessage("")}
        message={successMessage}
      />

      <Modal show={showProfileEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className={styles.avatarEditBlock}>
              <Image
                src={avatar}
                className={styles.avatarPreview}
                alt="avatar"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading..." : "Change photo"}
              </Button>
            </div>
            {avatarError && (
              <div className="text-danger mb-3">{avatarError}</div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Nickname</Form.Label>
              <div className={styles.nicknameControl}>
                {isEditingName ? (
                  <>
                    <Form.Control
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      isInvalid={!!nicknameError}
                      disabled={isValidating}
                    />
                    <Button
                      variant="link"
                      className={styles.editNameBtn}
                      onClick={() => setIsEditingName(false)}
                    >
                      <i className="fas fa-times" />
                      Cancel
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {nicknameError}
                    </Form.Control.Feedback>
                    {isValidating && (
                      <div className="text-muted mt-1">
                        Checking nickname...
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Form.Control
                      type="text"
                      value={nickname}
                      disabled
                      readOnly
                    />
                    <Button
                      variant="link"
                      className={styles.editNameBtn}
                      onClick={() => setIsEditingName(true)}
                    >
                      <i className="fas fa-pen" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            disabled={
              isEditingName
                ? !!nicknameError || isValidating || !nickname.trim()
                : false
            }
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;

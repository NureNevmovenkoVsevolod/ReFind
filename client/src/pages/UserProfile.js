import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./UserProfile.module.css";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/user.png";
import LossCard from "../components/LossCard/LossCard";
import { validateText } from "../utils/textModeration";
import axios from "axios";

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

  const userData = useMemo(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  }, []);

  useEffect(() => {
    setAvatar(userData?.user_pfp || userIcon);
  }, [userData]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          process.env.REACT_APP_SERVER_URL + "/api/advertisement/user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnnouncements(res.data.items || []);
      } catch (e) {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

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
      setAvatar(res.data.avatarUrl);
      // Update user in localStorage
      const updatedUser = { ...userData, user_pfp: res.data.avatarUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setAvatarError("Помилка завантаження аватара");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEditProfile = () => {
    setNickname(userData?.first_name || "");
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setNicknameError("");
    setIsEditingName(false);
  };

  const handleNicknameChange = async (e) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    setNicknameError("");

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for validation
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

    try {
      const token = localStorage.getItem("token");
      const userId = userData.user_id;
      await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/user/${userId}`,
        { first_name: nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update user in localStorage
      const updatedUser = { ...userData, first_name: nickname };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      handleCloseModal();
    } catch (err) {
      setNicknameError("Failed to update profile");
    }
  };

  const username = userData?.first_name || "Username";

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContent}>
        <Button variant="link" className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <h1 className={styles.username}>{username}</h1>
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
            {avatarError && <div style={{ color: "red", fontSize: 12 }}>{avatarError}</div>}
          </div>
          <div className={styles.profileInfo}>
            <Button variant="outline-secondary" className={styles.editBtn} onClick={handleEditProfile}>
              Edit profile
            </Button>
            <div className={styles.ratingBlock}>
              <div className={styles.ratingTitle}>Your rating:</div>
              <div className={styles.ratingValue}>4.5/5 ☆</div>
            </div>
          </div>
        </div>
        <h2 className={styles.announcementsTitle}>Recent announcements</h2>
        <div className={styles.announcementsList}>
          {loading ? (
            <div>Loading...</div>
          ) : announcements.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", width: "100%" }}>You have no announcements yet.</div>
          ) : (
            announcements.map((item) => (
              <LossCard
                key={item.advertisement_id}
                advertisement_id={item.advertisement_id}
                image={item.Images?.[0]?.image_url}
                date={item.incident_date ? new Date(item.incident_date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                title={item.title}
                description={item.description}
                cityName={item.location_description}
                categoryName={item.categorie_name || 'Other'}
              />
            ))
          )}
        </div>
      </div>

      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className={styles.avatarEditBlock}>
              <Image src={avatar} className={styles.avatarPreview} alt="avatar" />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading..." : "Change photo"}
              </Button>
            </div>
            {avatarError && <div className="text-danger mb-3">{avatarError}</div>}
            
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
                      <div className="text-muted mt-1">Checking nickname...</div>
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
            disabled={isEditingName ? (!!nicknameError || isValidating || !nickname.trim()) : false}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserProfile;

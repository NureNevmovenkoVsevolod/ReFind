import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../FormInput/FormInput";
import Map from "../Map/Map";
import styles from "./CreateAdvertForm.module.css";
import phoneIcon from "../../assets/phone.png";
import mailIcon from "../../assets/mail.png";
import calendarIcon from "../../assets/calendar.png";
import locationIcon from "../../assets/location.png";

const CreateAdvertForm = ({ type }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categorie_id: "",
    location_description: "",
    location_coordinates: { lat: 0, lng: 0 },
    reward: "0",
    phone: "",
    email: "",
    images: [],
    incident_date: new Date().toISOString().split("T")[0], // Add today as default date
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Завантаження категорій з БД
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        const formattedCategories = data.map((cat) => ({
          value: cat.categorie_id.toString(),
          label: cat.categorie_name,
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Create FormData object and append all form fields
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "location_coordinates") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== "images") {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append("type", type);

      // Append each image file
      if (formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Send the formData including files
      const response = await fetch("http://localhost:5000/api/advertisement", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const newAdvertisement = await response.json();
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating advertisement:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleLocationSelect = ({ lat, lng, address }) => {
    setFormData((prev) => ({
      ...prev,
      location_coordinates: { lat, lng },
      location_description: address,
    }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <FormInput
          label={type === "lost" ? "Lost item name" : "Found item name"}
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={
            type === "lost"
              ? "Description of lost item"
              : "Description of found item"
          }
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>{" "}
      <div className={styles.photoUpload}>
        <label>
          {type === "lost" ? "Lost item photo (Optional)" : "Found item photo"}
        </label>
        <div className={styles.uploadArea}>
          <div className={styles.imagePreview}>
            {formData.images.length > 0 ? (
              formData.images.map((url, index) => (
                <div key={index} className={styles.imageContainer}>
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.placeholder}>
                <span className={styles.cameraIcon}>📷</span>
                <span>Click or drag photos here</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className={styles.fileInput}
          />
        </div>
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label="Enter proper category"
          type="select"
          name="categorie_id"
          value={formData.categorie_id}
          onChange={handleChange}
          required
          options={categories}
        />
      </div>
      <div className={styles.locationGroup}>
        <FormInput
          label={`Where did you ${type === "lost" ? "lose" : "find"} item?`}
          type="text"
          name="location_description"
          value={formData.location_description}
          onChange={handleChange}
          icon={locationIcon}
          required
          placeholder="Click on the map to select location"
        />
        <Map
          onLocationSelect={handleLocationSelect}
          onAddressFound={(address) => {
            setFormData((prev) => ({
              ...prev,
              location_description: address,
            }));
          }}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={
            type === "lost" ? "Date of item lost" : "Date of item discovery"
          }
          type="date"
          name="incident_date"
          value={formData.incident_date}
          onChange={handleChange}
          icon={calendarIcon}
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={
            type === "lost"
              ? "Reward (0 for free no reward)"
              : "Bounty (0 for free of charge)"
          }
          type="number"
          name="reward"
          value={formData.reward}
          onChange={handleChange}
          required
          min="0"
        />
      </div>
      <div className={styles.contactInfo}>
        <FormInput
          label="Phone number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          icon={phoneIcon}
          required
        />

        <FormInput
          label="Email (Optional)"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={mailIcon}
        />
      </div>
      {type === "lost" && formData.reward > 0 && (
        <div className={styles.feeSection}>
          <h3>Fee 50₴</h3>
        </div>
      )}
      <button
        type="submit"
        className={`${styles.submitButton} ${
          type === "find" ? styles.outlineButton : ""
        }`}
      >
        Post
      </button>
    </form>
  );
};

export default CreateAdvertForm;

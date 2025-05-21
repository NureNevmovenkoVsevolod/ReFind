import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../FormInput/FormInput";
import Map from "../Map/Map";
import styles from "./CreateAdvertForm.module.css";
import phoneIcon from "../../assets/phone.png";
import mailIcon from "../../assets/mail.png";
import locationIcon from "../../assets/location.png";
import SuccessModal from "../Modal/SuccessModal";

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
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};
    
    // Перевірка заголовку
    if (!formData.title.trim()) {
      newErrors.title = "Введіть назву речі";
    }

    // Перевірка опису
    if (!formData.description.trim()) {
      newErrors.description = "Введіть опис речі";
    }

    // Перевірка категорії
    if (!formData.categorie_id) {
      newErrors.categorie_id = "Виберіть категорію";
    }

    // Перевірка локації
    if (!formData.location_description.trim()) {
      newErrors.location_description = "Виберіть місце на карті";
    }
    if (formData.location_coordinates.lat === 0 && formData.location_coordinates.lng === 0) {
      newErrors.location_coordinates = "Виберіть місце на карті";
    }

    // Перевірка дати
    if (!formData.incident_date) {
      newErrors.incident_date = "Виберіть дату";
    }

    // Перевірка телефону
    if (!formData.phone.trim()) {
      newErrors.phone = "Введіть номер телефону";
    } else if (!/^\+?[0-9]{10,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Введіть коректний номер телефону";
    }

    // Перевірка email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Введіть коректний email";
    }

    // Перевірка фотографій
    if (formData.images.length === 0) {
      newErrors.images = "Додайте хоча б одну фотографію";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Прокручуємо до першої помилки
      const firstError = document.querySelector(`[data-error="true"]`);
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      
      // Додаємо всі поля форми
      Object.keys(formData).forEach((key) => {
        if (key === "location_coordinates") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key !== "images") {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append("type", type);

      // Додаємо тільки файли з об'єктів images
      if (formData.images.length > 0) {
        formData.images.forEach((imageObj) => {
          formDataToSend.append("images", imageObj.file);
        });
      }

      const response = await fetch("http://localhost:5000/api/advertisement", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const newAdvertisement = await response.json();
        if (type === 'find') {
          setShowModal(true);
        } else {
          navigate("/");
        }
      } else {
        console.error("Server error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error creating advertisement:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
    if (name === 'images' && formData.images.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: undefined
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    setErrors(prev => ({
      ...prev,
      images: undefined
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
    if (formData.images.length > 1) {
      setErrors(prev => ({
        ...prev,
        images: undefined
      }));
    }
  };

  const replaceImage = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => {
        const newImages = [...prev.images];
        URL.revokeObjectURL(newImages[index].preview);
        newImages[index] = {
          file,
          preview: URL.createObjectURL(file)
        };
        return {
          ...prev,
          images: newImages
        };
      });
      setErrors(prev => ({
        ...prev,
        images: undefined
      }));
    }
  };

  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.preview) {
            URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [formData.images]);

  const handleLocationSelect = ({ lat, lng, address }) => {
    setFormData((prev) => ({
      ...prev,
      location_coordinates: { lat, lng },
      location_description: address,
    }));
    setErrors(prev => ({
      ...prev,
      location_description: undefined,
      location_coordinates: undefined
    }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <FormInput
          label={type === "lost" ? "Назва втраченої речі" : "Назва знайденої речі"}
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          error={errors.title}
          data-error={!!errors.title}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={type === "lost" ? "Опис втраченої речі" : "Опис знайденої речі"}
          type="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          error={errors.description}
          data-error={!!errors.description}
        />
      </div>{" "}
      <div className={styles.photoUpload}>
        <label className={styles.label}>
          {type === "lost" ? "Фотографії втраченої речі" : "Фотографії знайденої речі"}
        </label>
        <div className={`${styles.uploadArea} ${errors.images ? styles.error : ''}`}>
          <div className={styles.imagePreview}>
            {formData.images.map((image, index) => (
              <div key={index} className={styles.imageContainer}>
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                <div className={styles.imageActions}>
                  <label className={styles.replaceButton}>
                    Замінити
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => replaceImage(index, e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeImage(index)}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
            {formData.images.length < 5 && (
              <label className={styles.uploadButton}>
                <span>+ Додати фото</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          {errors.images && <div className={styles.error}>{errors.images}</div>}
        </div>
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label="Виберіть категорію"
          type="select"
          name="categorie_id"
          value={formData.categorie_id}
          onChange={handleChange}
          required
          options={categories}
          error={errors.categorie_id}
          data-error={!!errors.categorie_id}
          placeholder="Виберіть категорію"
        />
      </div>
      <div className={styles.locationGroup}>
        <FormInput
          label={`Де ви ${type === "lost" ? "втратили" : "знайшли"} річ?`}
          type="text"
          name="location_description"
          value={formData.location_description}
          onChange={handleChange}
          icon={locationIcon}
          required
          placeholder="Клікніть на карту, щоб вибрати місце"
          error={errors.location_description || errors.location_coordinates}
          data-error={!!(errors.location_description || errors.location_coordinates)}
        />
        <Map
          onLocationSelect={handleLocationSelect}
          onAddressFound={(address) => {
            setFormData((prev) => ({
              ...prev,
              location_description: address,
            }));
            setErrors(prev => ({
              ...prev,
              location_description: undefined,
              location_coordinates: undefined
            }));
          }}
        />
        {errors.location_coordinates && (
          <div className={styles.error} data-error="true">
            {errors.location_coordinates}
          </div>
        )}
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={
            type === "lost" ? "Дата втрати речі" : "Дата знахідки речі"
          }
          type="date"
          name="incident_date"
          value={formData.incident_date}
          onChange={handleChange}
          required
          error={errors.incident_date}
          data-error={!!errors.incident_date}
        />
      </div>
      <div className={styles.inputGroup}>
        <FormInput
          label={
            type === "lost"
              ? "Винагорода (0 - без винагороди)"
              : "Винагорода (0 - безкоштовно)"
          }
          type="number"
          name="reward"
          value={formData.reward}
          onChange={handleChange}
          required
          min="0"
          error={errors.reward}
          data-error={!!errors.reward}
        />
      </div>
      <div className={styles.contactInfo}>
        <FormInput
          label="Номер телефону"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          icon={phoneIcon}
          required
          error={errors.phone}
          data-error={!!errors.phone}
        />

        <FormInput
          label="Email (Необов'язково)"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={mailIcon}
          error={errors.email}
          data-error={!!errors.email}
        />
      </div>
      {type === "lost" && formData.reward > 0 && (
        <div className={styles.feeSection}>
          <h3>Комісія 50₴</h3>
        </div>
      )}
      <button
        type="submit"
        className={`${styles.submitButton} ${
          type === "find" ? styles.outlineButton : ""
        }`}
      >
        Опублікувати
      </button>

      <SuccessModal show={showModal} handleClose={handleCloseModal} />
    </form>
  );
};

export default CreateAdvertForm;

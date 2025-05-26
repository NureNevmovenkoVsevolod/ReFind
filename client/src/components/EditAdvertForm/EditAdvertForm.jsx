import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../FormInput/FormInput";
import Map from "../Map/Map";
import styles from "../CreateAdvertForm/CreateAdvertForm.module.css";
import phoneIcon from "../../assets/phone.png";
import mailIcon from "../../assets/mail.png";
import locationIcon from "../../assets/location.png";
import SuccessModal from "../Modal/SuccessModal";


const EditAdvertForm = ({ type, initialData, onSuccess, onCancel, isEdit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    categorie_id: initialData?.categorie_id?.toString() || "",
    location_description: initialData?.location_description || "",
    location_coordinates: initialData?.location_coordinates
      ? typeof initialData.location_coordinates === "string"
        ? JSON.parse(initialData.location_coordinates)
        : initialData.location_coordinates
      : { lat: 0, lng: 0 },
    reward: initialData?.reward?.toString() || "0",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    images: initialData?.Images
      ? initialData.Images.map(img => ({ preview: img.image_url }))
      : [],
    incident_date: initialData?.incident_date
      ? initialData.incident_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    console.log("EditAdvertForm mounted", { initialData, type, isEdit });
  }, [initialData, type, isEdit]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL+"/api/categories");
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
    if (!formData.title.trim()) newErrors.title = "Введіть назву речі";
    if (!formData.description.trim()) newErrors.description = "Введіть опис речі";
    if (!formData.categorie_id) newErrors.categorie_id = "Виберіть категорію";
    if (!formData.location_description.trim()) newErrors.location_description = "Виберіть місце на карті";
    if (formData.location_coordinates.lat === 0 && formData.location_coordinates.lng === 0) newErrors.location_coordinates = "Виберіть місце на карті";
    if (!formData.incident_date) newErrors.incident_date = "Виберіть дату";
    if (!formData.phone.trim()) newErrors.phone = "Введіть номер телефону";
    else if (!/^\+?[0-9]{10,13}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = "Введіть коректний номер телефону";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Введіть коректний email";
    if (formData.images.length === 0) newErrors.images = "Додайте хоча б одну фотографію";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isImageObjEqual = (a, b) => {
    if (!a || !b) return false;
    if (typeof a.preview === 'undefined' || typeof b.preview === 'undefined') return false;
    return a.preview === b.preview && !a.file && !b.file;
  };
  const isFormDataChanged = (formData, initialData) => {
    const fields = [
      "title", "description", "categorie_id", "location_description", "reward", "phone", "email", "incident_date"
    ];
    for (const field of fields) {
      if ((formData[field] || "") !== (initialData[field] || "")) return true;
    }
    const coordsA = formData.location_coordinates || {};
    const coordsB = typeof initialData.location_coordinates === "string"
      ? JSON.parse(initialData.location_coordinates)
      : (initialData.location_coordinates || {});
    if (coordsA.lat !== coordsB.lat || coordsA.lng !== coordsB.lng) return true;
    const imgsA = formData.images || [];
    const imgsB = (initialData.Images || []).map(img => ({ preview: img.image_url }));
    if (imgsA.length !== imgsB.length) return true;
    for (let i = 0; i < imgsA.length; i++) {
      if (!isImageObjEqual(imgsA[i], imgsB[i])) return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EditAdvertForm submit", formData);
    if (!validateForm()) {
      const firstError = document.querySelector(`[data-error="true"]`);
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!isFormDataChanged(formData, initialData)) {
      setStatus('nochange');
      setShowModal(true);
      return;
    }
    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();
    const fields = [
      "title", "description", "categorie_id", "location_description", "reward", "phone", "email", "incident_date"
    ];
    fields.forEach(field => {
      if ((formData[field] || "") !== (initialData[field] || "")) {
        formDataToSend.append(field, formData[field]);
      }
    });
    const coordsA = formData.location_coordinates || {};
    const coordsB = typeof initialData.location_coordinates === "string"
      ? JSON.parse(initialData.location_coordinates)
      : (initialData.location_coordinates || {});
    if (coordsA.lat !== coordsB.lat || coordsA.lng !== coordsB.lng) {
      formDataToSend.append("location_coordinates", JSON.stringify(coordsA));
    }
    const imgsA = formData.images || [];
    const imgsB = (initialData.Images || []).map(img => ({ preview: img.image_url }));
    let imagesChanged = false;
    if (imgsA.length !== imgsB.length) imagesChanged = true;
    for (let i = 0; i < imgsA.length; i++) {
      if (!isImageObjEqual(imgsA[i], imgsB[i])) imagesChanged = true;
    }
    if (imagesChanged) {
      imgsA.forEach((imageObj) => {
        if (imageObj.file) {
          formDataToSend.append("images", imageObj.file);
        } else if (imageObj.preview && !imageObj.file) {
          formDataToSend.append("existingImages", imageObj.preview);
        }
      });
    }
    formDataToSend.append("type", type);
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL+`/api/advertisement/${initialData.advertisement_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );
      console.log("EditAdvertForm PUT response", response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("EditAdvertForm server error details:", errorData);
        throw new Error('Failed to update advertisement');
      }
      const updatedAd = await response.json();
      setStatus('success');
      setShowModal(true);
      if (onSuccess) onSuccess(updatedAd);
    } catch (error) {
      console.error("EditAdvertForm error:", error);
      setStatus('error');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (status === 'success') {
      if (onSuccess) onSuccess(formData);
      navigate("/profile");
    } else if (onCancel) {
      onCancel();
    }
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
      if (newImages[index].preview && newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
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
        if (newImages[index].preview && newImages[index].file) {
          URL.revokeObjectURL(newImages[index].preview);
        }
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
        if (image.preview && image.file) {
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

  // Helper to ensure valid coordinates
  const getValidCoordinates = (coords) => {
    if (!coords || typeof coords !== 'object') return { lat: 50.4501, lng: 30.5234 };
    const lat = Number(coords.lat);
    const lng = Number(coords.lng);
    if (isNaN(lat) || isNaN(lng)) return { lat: 50.4501, lng: 30.5234 };
    return { lat, lng };
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
      </div>
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
          initialCoordinates={getValidCoordinates(formData.location_coordinates)}
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
      <button
        type="submit"
        className={styles.submitButton}
      >
        Зберегти зміни
      </button>
      <button
        type="button"
        className={styles.outlineButton}
        style={{ marginTop: 10 }}
        onClick={onCancel}
      >
        Скасувати
      </button>
      <SuccessModal
        show={showModal}
        handleClose={handleCloseModal}
        message={
          status === 'success'
            ? "Оголошення оновлено успішно!"
            : status === 'nochange'
            ? "Жодних змін не внесено."
            : "Сталася помилка при оновленні оголошення."
        }
      />
    </form>
  );
};

export default EditAdvertForm; 
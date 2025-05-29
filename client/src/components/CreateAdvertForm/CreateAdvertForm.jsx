import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../FormInput/FormInput";
import Map from "../Map/Map";
import styles from "./CreateAdvertForm.module.css";
import phoneIcon from "../../assets/phone.png";
import mailIcon from "../../assets/mail.png";
import locationIcon from "../../assets/location.png";
import SuccessModal from "../Modal/SuccessModal";
import { t } from '../../utils/i18n';

// Мапа з назви категорії з БД на ключ для t()
const CATEGORY_NAME_TO_KEY = {
  'Гаманець': 'category.wallet',
  'Телефон': 'category.phone',
  'Документ': 'category.document',
  'Ключ': 'category.key',
  'Тварина': 'category.animal',
  'Одяг': 'category.clothes',
  'Електроніка': 'category.electronics',
  'Гаджет': 'category.gadget',
  'Інше': 'category.other',
};

const CreateAdvertForm = ({ type, ...props }) => {
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
    incident_date: new Date().toISOString().split("T")[0], 
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [googlePayClient, setGooglePayClient] = useState(null);

  useEffect(() => {
    const initializeGooglePay = () => {
      if (window.google && window.google.payments) {
        const client = new window.google.payments.api.PaymentsClient({
          environment: 'TEST'
        });
        setGooglePayClient(client);
      }
    };

    if (window.google && window.google.payments) {
      initializeGooglePay();
    } else {
      window.onGooglePayLoaded = initializeGooglePay;
    }
  }, []);

  useEffect(() => {
    // Завантаження категорій з БД
    const fetchCategories = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL+"/api/categories");
        const data = await response.json();
        const formattedCategories = data.map((cat) => ({
          value: cat.categorie_id.toString(),
          label: t(CATEGORY_NAME_TO_KEY[cat.categorie_name] || cat.categorie_name),
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

  const initializePayment = async () => {
    if (!googlePayClient) {
      throw new Error('Google Pay не ініціалізовано');
    }

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'ReFind'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: '50.00',
          currencyCode: 'UAH',
          countryCode: 'UA'
        }
      };

      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
      return paymentData;
    } catch (error) {
      if (error.statusCode === 'CANCELED') {
        throw new Error('CANCELED');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector(`[data-error="true"]`);
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "location_coordinates") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key !== "images") {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append("type", type);
    if (formData.images.length > 0) {
      formData.images.forEach((imageObj) => {
        if (imageObj.file) {
          formDataToSend.append("images", imageObj.file);
        } else if (imageObj.preview) {
          formDataToSend.append("existingImages", imageObj.preview);
        }
      });
    }

    if (type === 'lost') {
      try {        
        const paymentData = await initializePayment();

        // Спочатку створюємо оголошення
        const response = await fetch(process.env.REACT_APP_SERVER_URL+"/api/advertisement", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        console.log("Advertisement creation response:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Server error details:", errorData);
          throw new Error('Failed to create advertisement');
        }

        const newAdvertisement = await response.json();
        console.log("Created advertisement:", newAdvertisement);

        // Після створення оголошення, зберігаємо дані про платіж
        const paymentResponse = await fetch(process.env.REACT_APP_SERVER_URL+"/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            advertisement_id: newAdvertisement.advertisement_id,
            payment_data: paymentData
          }),
        });

        console.log("Payment creation response:", paymentResponse.status, paymentResponse.statusText);

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          console.error("Payment error details:", errorData);
          throw new Error('Failed to save payment data');
        }

        setPaymentStatus('success');
        setShowModal(true);
      } catch (error) {
        console.error("Error in advertisement creation:", error);
        if (error.message === 'CANCELED') {
          setPaymentStatus('canceled');
        } else {
          setPaymentStatus('error');
        }
        setShowModal(true);
      }
    } else {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER_URL+"/api/advertisement", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });

        console.log("Advertisement creation response:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Server error details:", errorData);
          throw new Error('Failed to create advertisement');
        }

        const newAdvertisement = await response.json();
        console.log("Created advertisement:", newAdvertisement);

        setPaymentStatus('success');
        setShowModal(true);
      } catch (error) {
        console.error("Error creating advertisement:", error);
        setPaymentStatus('error');
        setShowModal(true);
      }
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
          label={type === "lost" ? t('createAdvert.lostTitle') : t('createAdvert.foundTitle')}
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
          label={type === "lost" ? t('createAdvert.lostDescription') : t('createAdvert.foundDescription')}
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
          {type === "lost" ? t('createAdvert.lostPhotos') : t('createAdvert.foundPhotos')}
        </label>
        <div className={`${styles.uploadArea} ${errors.images ? styles.error : ''}`}>
          <div className={styles.imagePreview}>
            {formData.images.map((image, index) => (
              <div key={index} className={styles.imageContainer}>
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                <div className={styles.imageActions}>
                  <label className={styles.replaceButton}>
                    {t('createAdvert.replace')}
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
                    {t('createAdvert.remove')}
                  </button>
                </div>
              </div>
            ))}
            {formData.images.length < 5 && (
              <label className={styles.uploadButton}>
                <span>{t('createAdvert.addPhoto')}</span>
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
          label={t('createAdvert.selectCategory')}
          type="select"
          name="categorie_id"
          value={formData.categorie_id}
          onChange={handleChange}
          required
          options={categories}
          error={errors.categorie_id}
          data-error={!!errors.categorie_id}
          placeholder={t('createAdvert.selectCategory')}
        />
      </div>
      <div className={styles.locationGroup}>
        <FormInput
          label={type === "lost" ? t('createAdvert.whereLost') : t('createAdvert.whereFound')}
          type="text"
          name="location_description"
          value={formData.location_description}
          onChange={handleChange}
          icon={locationIcon}
          required
          placeholder={t('createAdvert.mapPlaceholder')}
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
          label={type === "lost" ? t('createAdvert.lostDate') : t('createAdvert.foundDate')}
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
          label={type === "lost" ? t('createAdvert.rewardLost') : t('createAdvert.rewardFound')}
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
          label={t('createAdvert.phone')}
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
          label={t('createAdvert.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={mailIcon}
          error={errors.email}
          data-error={!!errors.email}
        />
      </div>
      {type === "lost" && (
        <div className={styles.feeSection}>
          <h3>{t('createAdvert.price')}</h3>
        </div>
      )}
      <button
        type="submit"
        className={`${styles.submitButton} ${
          type === "find" ? styles.outlineButton : ""
        }`}
      >
        {t('createAdvert.publish')}
      </button>

      <SuccessModal 
        show={showModal} 
        handleClose={handleCloseModal}
        message={
          paymentStatus === 'success' 
            ? t('createAdvert.success')
            : paymentStatus === 'canceled'
            ? t('createAdvert.canceled')
            : t('createAdvert.error')
        }
      />
    </form>
  );
};

export default CreateAdvertForm;
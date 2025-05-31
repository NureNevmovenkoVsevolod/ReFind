import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, TouchableOpacity, Modal, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

// Константи
const API_URL = 'https://refind-wm5m.onrender.com/api';
const PHONE_PREFIXES = ['38050', '38063', '38066', '38067', '38068', '38073', '38093', '38096', '38097', '38098', '38099'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGES = 5;
const DEFAULT_COORDS = { lat: 50.4501, lng: 30.5234 };

// HTML для карти
const leafletHtml = (initialCoords = DEFAULT_COORDS) => `
<!DOCTYPE html>
<html>
<head>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-container .leaflet-routing-container-hide { display: none; }
    .current-location-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map" style="width: 100%; height: 100%;"></div>
  <button id="currentLocationBtn" class="current-location-btn">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
    </svg>
  </button>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${initialCoords.lat}, ${initialCoords.lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var marker = L.marker([${initialCoords.lat}, ${initialCoords.lng}], {
      draggable: true
    }).addTo(map);

    marker.on('dragend', function(event) {
      var position = marker.getLatLng();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'location',
          lat: position.lat,
          lng: position.lng
        }));
      }
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'location',
          lat: e.latlng.lat,
          lng: e.latlng.lng
        }));
      }
    });

    document.getElementById('currentLocationBtn').addEventListener('click', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'getCurrentLocation'
        }));
      }
    });
  </script>
</body>
</html>
`;

const CreateAdvertisementScreen = ({ navigation, route }) => {
  // Стани
  const [type, setType] = useState(route.params?.type || 'find');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorie_id: '',
    location_description: '',
    location_coordinates: '',
    reward: '0',
    phone: '',
    email: '',
    incident_date: new Date().toISOString().split('T')[0],
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(formData.incident_date));
  const [mapInitialized, setMapInitialized] = useState(false);
  const webViewRef = useRef(null);

  // Запит дозволів
  useEffect(() => {
    const requestPermissions = async () => {
      const [mediaStatus, locationStatus] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        Location.requestForegroundPermissionsAsync()
      ]);

      if (mediaStatus.status !== 'granted') {
        Alert.alert('Дозвіл не надано', 'Потрібен дозвіл для доступу до галереї фотографій.');
      }
      if (locationStatus.status !== 'granted') {
        Alert.alert('Потрібен дозвіл', 'Для використання поточної локації потрібен дозвіл на доступ до геолокації.');
      }
    };

    requestPermissions();
  }, []);

  // Завантаження категорій
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data.map(cat => ({ 
            label: cat.categorie_name, 
            value: cat.categorie_id.toString() 
          })));
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Обробники змін
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const handleCategorySelect = useCallback((category) => {
    handleChange('categorie_id', category.value);
    setIsCategoryDropdownVisible(false);
  }, [handleChange]);

  // Обробка зображень
  const pickImage = async () => {
    if (formData.images.length >= MAX_IMAGES) {
      Alert.alert('Обмеження на фото', `Ви можете вибрати не більше ${MAX_IMAGES} фотографій.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: MAX_IMAGES - formData.images.length,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || asset.uri.split('/').pop(),
        }));
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        setErrors(prev => ({ ...prev, images: undefined }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати зображення');
    }
  };

  const removeImage = useCallback((index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  }, []);

  // Валідація
  const validatePhone = useCallback((phone) => {
    if (!phone) return "Номер телефону обов'язковий";
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 12) return "Номер телефону має містити 12 цифр";
    if (!cleaned.startsWith('380')) return "Номер телефону має починатися з 380";
    
    const prefix = cleaned.substring(0, 5);
    if (!PHONE_PREFIXES.includes(prefix)) return "Введіть коректний український номер телефону";
    
    return null;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Базові перевірки
    if (!formData.title.trim()) newErrors.title = "Заголовок обов'язковий";
    if (!formData.description.trim()) newErrors.description = "Опис обов'язковий";
    if (!formData.categorie_id) newErrors.categorie_id = "Виберіть категорію";
    if (formData.images.length === 0) newErrors.images = "Додайте хоча б одне фото";

    // Валідація дати
    const selectedDate = new Date(formData.incident_date);
    const currentDate = new Date();
    if (!formData.incident_date) {
      newErrors.incident_date = "Виберіть дату";
    } else if (selectedDate > currentDate) {
      newErrors.incident_date = "Дата не може бути в майбутньому";
    }

    // Валідація email
    if (formData.email && formData.email.trim()) {
      if (!EMAIL_REGEX.test(formData.email.trim())) {
        newErrors.email = "Введіть коректний email";
      }
    }

    // Валідація телефону
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePhone]);

  // Форматування телефону
  const formatPhoneNumber = useCallback((text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('380')) return cleaned;
    if (cleaned.startsWith('0')) return '380' + cleaned.substring(1);
    if (cleaned.length < 10) return '380' + cleaned;
    return cleaned.substring(0, 12);
  }, []);

  const handlePhoneChange = useCallback((text) => {
    const formattedNumber = formatPhoneNumber(text);
    handleChange('phone', formattedNumber);
  }, [formatPhoneNumber, handleChange]);

  // Обробка карти
  const handleMapMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location') {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}&zoom=18&addressdetails=1`
          );
          const result = await response.json();
          const address = result.display_name || '';

          setFormData(prev => ({
            ...prev,
            location_coordinates: JSON.stringify({ lat: data.lat, lng: data.lng }),
            location_description: address
          }));
        } catch (error) {
          console.error('Error getting address:', error);
          setFormData(prev => ({
            ...prev,
            location_coordinates: JSON.stringify({ lat: data.lat, lng: data.lng })
          }));
        }
      } else if (data.type === 'getCurrentLocation') {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const result = await response.json();
          const address = result.display_name || '';

          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              map.setView([${latitude}, ${longitude}], 16);
              marker.setLatLng([${latitude}, ${longitude}]);
              true;
            `);
          }

          setFormData(prev => ({
            ...prev,
            location_coordinates: JSON.stringify({ lat: latitude, lng: longitude }),
            location_description: address
          }));
        } catch (error) {
          console.error('Error getting address:', error);
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              map.setView([${latitude}, ${longitude}], 16);
              marker.setLatLng([${latitude}, ${longitude}]);
              true;
            `);
          }
          setFormData(prev => ({
            ...prev,
            location_coordinates: JSON.stringify({ lat: latitude, lng: longitude })
          }));
        }
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  }, []);

  const handleWebViewLoad = useCallback(() => {
    if (!mapInitialized) setMapInitialized(true);
  }, [mapInitialized]);

  // Відправка форми
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Помилка валідації', "Будь ласка, заповніть всі обов'язкові поля коректно.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Помилка', 'Будь ласка, увійдіть в систему');
        navigation.navigate('Login');
        return;
      }

      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          dataToSend.append(key, value);
        }
      });
      dataToSend.append('type', type);

      formData.images.forEach((image, index) => {
        dataToSend.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${index}.jpg`
        });
      });

      const res = await fetch(`${API_URL}/advertisement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: dataToSend,
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert(
          'Оголошення створено',
          'Ваше оголошення успішно створено і відправлено на модерацію. Після перевірки воно буде опубліковане.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        console.error('Помилка сервера:', result);
        Alert.alert('Помилка', result.message || 'Не вдалося створити оголошення');
      }
    } catch (e) {
      console.error('Error creating advertisement:', e);
      Alert.alert('Помилка', 'Сталася помилка при створенні оголошення');
    } finally {
      setLoading(false);
    }
  };

  // Допоміжні функції
  const getCategoryLabel = useCallback((categoryId) => {
    const category = categories.find(cat => cat.value === categoryId);
    return category ? category.label : '-- Виберіть категорію --';
  }, [categories]);

  const onChangeDate = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    handleChange('incident_date', `${year}-${month}-${day}`);
  }, [date, handleChange]);

  const formatDateDisplay = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Створити оголошення</Text>
      
      {/* Type Selection Toggle */}
      <View style={styles.typeToggleContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'find' && styles.typeButtonActive]}
          onPress={() => setType('find')}
        >
          <Text style={[styles.typeButtonText, type === 'find' && styles.typeButtonTextActive]}>Знайдено</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'lost' && styles.typeButtonActive]}
          onPress={() => setType('lost')}
        >
          <Text style={[styles.typeButtonText, type === 'lost' && styles.typeButtonTextActive]}>Загублено</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.inputContainerStyle}>
        <Text style={styles.labelStyle}>
          {type === 'lost' ? "Заголовок загубленої речі" : "Заголовок знайденої речі"}
        </Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="title" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="Введіть заголовок"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            style={[styles.input, styles.inputWithIconText]}
          />
        </View>
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.inputContainerStyle}>
        <Text style={styles.labelStyle}>
          {type === 'lost' ? "Опис загубленої речі" : "Опис знайденої речі"}
        </Text>
        <TextInput
          placeholder="Введіть опис"
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          multiline={true}
          style={styles.descriptionInput}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>
      
      {/* Image Upload Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Фотографії {type === 'lost' ? 'загубленої' : 'знайденої'} речі ({formData.images.length}/{MAX_IMAGES})</Text>
        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imagePreviewItem}>
              <Image source={{ uri: image.uri }} style={styles.imagePreviewImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {formData.images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <MaterialIcons name="add-a-photo" size={40} color="#666" />
              <Text style={{color: '#666', marginTop: 5}}>Додати фото</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
      </View>

      {/* Category Dropdown */}
      <View style={styles.inputContainerStyle}> 
        <Text style={styles.labelStyle}>Категорія</Text> 
        <TouchableOpacity 
           style={[styles.input, styles.dropdownButton]}
           onPress={() => setIsCategoryDropdownVisible(true)}
        >
           <Text style={styles.dropdownButtonText}>
             {getCategoryLabel(formData.categorie_id)}
           </Text>
        </TouchableOpacity>
         {errors.categorie_id && <Text style={styles.errorText}>{errors.categorie_id}</Text>}
      </View>

      {/* Category Dropdown Modal */}
      <Modal
        visible={isCategoryDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoryDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCategoryDropdownVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView style={styles.dropdownList}>
              {categories.map(category => (
                <TouchableOpacity 
                  key={category.value} 
                  style={styles.dropdownItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.dropdownItemText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Map Component */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapLabel}>
          {type === 'lost' ? "Де загублено?" : "Де знайдено?"}
        </Text>
        <View style={styles.map}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: leafletHtml() }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMapMessage}
            onLoad={handleWebViewLoad}
          />
        </View>
      </View>

      {/* Date Picker Input */}
      <View style={styles.inputContainerStyle}>
         <Text style={styles.labelStyle}>{type === 'lost' ? "Дата, коли загублено" : "Дата, коли знайдено"}</Text>
         <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, styles.datePickerButton]}>
           <MaterialIcons name="event" size={20} color="#999" style={styles.iconStyle} />
           <Text style={styles.datePickerButtonText}>
             {formData.incident_date ? formatDateDisplay(formData.incident_date) : "Виберіть дату"}
           </Text>
         </TouchableOpacity>
          {errors.incident_date && <Text style={styles.errorText}>{errors.incident_date}</Text>}
      </View>

      {/* Date Picker Modal/Component */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      <View style={styles.inputContainerStyle}>
        <Text style={styles.labelStyle}>Винагорода (0 - безкоштовно)</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="card-giftcard" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="0"
            value={formData.reward}
            onChangeText={(text) => handleChange('reward', text)}
            keyboardType="numeric"
            style={[styles.input, styles.inputWithIconText]}
          />
        </View>
        {errors.reward && <Text style={styles.errorText}>{errors.reward}</Text>}
      </View>

      <View style={styles.inputContainerStyle}>
        <Text style={styles.labelStyle}>Номер телефону</Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            placeholder="Введіть номер телефона"
            value={formData.phone}
            onChangeText={handlePhoneChange}
            keyboardType="numeric"
            maxLength={12}
            style={[styles.input, styles.inputWithIconText]}
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.inputContainerStyle}>
        <Text style={styles.labelStyle}>
          Email (необов'язково)
        </Text>
        <View style={styles.inputWithIcon}>
          <MaterialIcons
            name="email"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Введіть ваш email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, styles.inputWithIconText]}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Опублікувати</Text>
        )}
      </TouchableOpacity>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginBlock: 20
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#23272f',
  },
  typeToggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  typeButtonActive: {
    backgroundColor: '#5a67d8',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#23272f',
    textAlign: 'center',
  },
  inputContainerStyle: {
    width: "100%",
    marginBottom: 16,
  },
  labelStyle: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
    color: '#23272f',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#23272f',
  },
  inputWithIcon: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10,
    color: '#999',
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    paddingLeft: 0,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#23272f',
  },
  submitButton: {
    backgroundColor: '#5a67d8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
    marginBottom: 15,
    paddingLeft: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 40,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#23272f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    maxHeight: '50%',
    width: '80%',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#23272f',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imagePreviewItem: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 40,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#23272f',
  },
  iconStyle: {
    marginRight: 6,
    color: '#999',
  },
  mapContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#23272f',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  map: {
    height: 200,
    width: '100%',
  },
});

export default CreateAdvertisementScreen; 
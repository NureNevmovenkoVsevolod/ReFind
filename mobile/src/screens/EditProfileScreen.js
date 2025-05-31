import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OurTextInput from '../components/OurTextInput';
import EmailInput from '../components/EmailInput';
import Constants from 'expo-constants';

const DEFAULT_AVATAR = 'https://via.placeholder.com/100x100.png?text=User';
const apiUrl = 'https://refind-wm5m.onrender.com/api';

const EditProfileScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.user_id && user.id) {
          user.user_id = user.id;
        }
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setEmail(user.email || '');
        setPhone(user.phone_number || '');
        setAvatar(user.user_pfp || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Дозвіл', 'Потрібен дозвіл для доступу до галереї');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    // Український номер: +380XXXXXXXXX або 0XXXXXXXXX
    const re = /^(\+380|0)\d{9}$/;
    return re.test(phone);
  };

  const fetchWithTimeout = (resource, options = {}, timeout = 15000) => {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Таймаут запиту')), timeout)
      ),
    ]);
  };

  const handleSave = async () => {
    console.log('handleSave called');
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ім'я та прізвище обов'язкові");
      return;
    }
    if (!validateEmail(email)) {
      setError('Некоректний email');
      return;
    }
    if (phone && !validatePhone(phone)) {
      setError('Некоректний номер телефону');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : {};
      if (!user.user_id && user.id) {
        user.user_id = user.id;
      }
      let avatarUrl = avatar;
      if (!user.user_id) {
        setError('Не знайдено user_id у userData!');
        setSaving(false);
        return;
      }
      // Якщо аватарка локальна, завантажити на сервер
      if (avatar && avatar.startsWith('file')) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        try {
          const uploadRes = await fetchWithTimeout(`${apiUrl}/upload/avatar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }, 20000);
          if (!uploadRes.ok) {
            throw new Error('Помилка завантаження аватарки');
          }
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.avatarUrl || avatarUrl;
        } catch (e) {
          setError(e.message || 'Помилка завантаження аватарки');
          setSaving(false);
          return;
        }
      }
      const endpoint = `${apiUrl}/user/${user.user_id}`;
      console.log('Endpoint:', endpoint);
      let res;
      const bodyData = {
        first_name: firstName,
        last_name: lastName,
        email,
        user_pfp: avatarUrl,
        phone_number: phone,
      };
      console.log('bodyData:', bodyData);
      try {
        res = await fetchWithTimeout(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }, 20000);
      } catch (e) {
        setError(e.message || 'Помилка збереження (таймаут або мережа)');
        setSaving(false);
        return;
      }
      console.log('res.status:', res.status);
      if (!res.ok) {
        let err;
        try { err = await res.json(); } catch { err = {}; }
        setError(err.message || 'Помилка оновлення профілю');
        setSaving(false);
        return;
      }
      const updatedUser = await res.json();
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      Alert.alert('Успіх', 'Профіль оновлено!');
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  if (loading || saving) {
    return <ActivityIndicator size="large" color="#5a67d8" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.avatarBlock} onPress={pickAvatar}>
        <Image
          source={{ uri: avatar || DEFAULT_AVATAR }}
          style={styles.avatar}
        />
        <Text style={styles.avatarText}>Змінити фото</Text>
      </TouchableOpacity>
      <OurTextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Введіть ім'я"
        label="Ім'я"
        icon="person"
      />
      <OurTextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Введіть прізвище"
        label="Прізвище"
        icon="person"
      />
      <EmailInput
        value={email}
        onChangeText={setEmail}
      />
      <OurTextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Введіть телефон"
        label="Телефон"
        icon="phone"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{saving ? 'Збереження...' : 'Зберегти зміни'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  avatarText: {
    color: '#5a67d8',
    fontSize: 15,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default EditProfileScreen; 
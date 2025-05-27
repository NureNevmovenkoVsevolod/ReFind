import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import Constants from 'expo-constants';
import EmailInput from '../components/EmailInput';
import PasswordInput from '../components/PasswordInput';
import OurTextInput from '../components/OurTextInput';

const apiUrl = Constants.expoConfig.extra.API_URL;

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const webViewRef = useRef(null);

  const validatePasswords = (pass, confirmPass) => {
    if (pass && confirmPass && pass !== confirmPass) {
      setPasswordError("Паролі не співпадають");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validatePasswords(text, confirmPassword);
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    validatePasswords(password, text);
  };

  const handleRegister = async () => {
    setRegisterError('');

    if (!validatePasswords(password, confirmPassword)) {
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      });

      const token = response.data.token;
      const user = response.data.user;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      navigation.navigate('Main');

    } catch (error) {
       if (error.response) {
        if (error.response.status === 400) {
          setRegisterError("Користувач з таким email вже існує");
        } else {
          setRegisterError(error.response.data.message || "Помилка реєстрації");
        }
      } else {
        setRegisterError("Помилка сервера");
      }
    }
  };

 
  const handleSocialAuth = (provider) => {
    setIsLoading(true);
    const url = `${apiUrl}/auth/${provider}`;
    setAuthUrl(url);
    setIsWebViewVisible(true);
    setIsLoading(false);
  };

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;

    // Перевіряємо чи це callback URL з успішною авторизацією
    if (url.includes('/auth/success')) {
      try {
        // Витягуємо дані з URL
        const urlObj = new URL(url);
        const encodedData = urlObj.searchParams.get('data');

        if (encodedData) {
          const authData = JSON.parse(decodeURIComponent(encodedData));

           if (authData.user.role === 'admin' || authData.user.role === 'moder') {
            Alert.alert('Помилка', 'Доступ заборонено для адміністраторів та модераторів');
            setIsWebViewVisible(false);
            return;
          }

          await AsyncStorage.setItem('userToken', authData.token);
          await AsyncStorage.setItem('userData', JSON.stringify(authData.user));

          // Закриваємо WebView та переходимо на головну сторінку
          setIsWebViewVisible(false);
          navigation.navigate('Main');
        }
      } catch (error) {
        console.error('Error processing auth data:', error);
        Alert.alert('Помилка', 'Помилка при обробці даних авторизації');
        setIsWebViewVisible(false);
      }
    }

    if (url.includes('error=')) {
      const urlObj = new URL(url);
      const error = urlObj.searchParams.get('error');

      let errorMessage = 'Помилка авторизації';
      switch (error) {
        case 'google_auth_failed':
          errorMessage = 'Помилка авторизації через Google';
          break;
        case 'no_user_data':
          errorMessage = 'Не вдалося отримати дані користувача';
          break;
        case 'token_generation_failed':
          errorMessage = 'Помилка генерації токену';
          break;
        case 'authentication_failed':
          errorMessage = 'Помилка аутентифікації';
          break;
      }

      Alert.alert('Помилка', errorMessage);
      setIsWebViewVisible(false);
    }
  };

  const closeWebView = () => {
    setIsWebViewVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Реєстрація</Text>

       {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

      <OurTextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Введіть ваше ім'я"
        label="Ім'я"
        icon="person"
      />
      <OurTextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Введіть ваше прізвище"
        label="Прізвище"
        icon="person"
      />
      <EmailInput
        value={email}
        onChangeText={setEmail}
      />
      <PasswordInput
        placeholder="Створити пароль"
        value={password}
        onChangeText={handlePasswordChange}
      />
      <PasswordInput
        placeholder="Підтвердіть пароль"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Зареєструватися</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>або зареєструватися через</Text>
        <View style={styles.line} />
      </View>

       <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialAuth('google')}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <FontAwesome name="google" size={20} color="red" />
          )}
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialAuth('facebook')}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1877F2" />
          ) : (
            <FontAwesome name="facebook" size={20} color="#1877F2" />
          )}
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.bottomText}>
          Вже є акаунт? <Text style={styles.loginLink}>Увійти</Text>
        </Text>
      </TouchableOpacity>

       <Modal
        visible={isWebViewVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeWebView} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Авторизація</Text>
          </View>

          <WebView
            ref={webViewRef}
            source={{ uri: authUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
             renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5a67d8" />
                <Text>Завантаження...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              Alert.alert('Помилка', 'Помилка завантаження сторінки авторизації');
            }}
             userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    marginBlock: 20
  },
   backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#777',
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
   socialText: {
    fontSize: 14,
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
  },
  loginLink: {
    color: '#5a67d8',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
    modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 50,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default RegisterScreen; 
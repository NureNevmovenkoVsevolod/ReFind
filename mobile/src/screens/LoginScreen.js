import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import PasswordInput from '../components/PasswordInput';
import EmailInput from '../components/EmailInput';

const apiUrl = Constants.expoConfig.extra.API_URL;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setLoginError('');
  }, [email, password]);

  const handleLogin = async () => {
    setLoginError('');

    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email: email,
        password: password,
      });

      const userRole = response.data.user.role; 

      if (userRole === 'admin' || userRole === 'moder') {
        setLoginError('Адміністратори та модератори не можуть увійти через мобільний застосунок.');
        return;
      }

      const token = response.data.token; 
      const user = response.data.user;  

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user)); 

      navigation.navigate('Main'); 

    } catch (error) {
      setLoginError('Неправильний email або пароль');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Вхід</Text>

      {loginError ? <Text style={styles.loginErrorText}>{loginError}</Text> : null}

      <EmailInput value={email} onChangeText={setEmail} />

      <PasswordInput value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Увійти</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>або увійти через</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={20} color="red" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={20} color="#1877F2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.bottomText}>
          Немає акаунту? <Text style={styles.registerLink}>Зареєструватися</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      paddingTop: 48,
      backgroundColor: '#fff',
      marginBlock:20
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      marginHorizontal: "auto",
      marginTop: 16,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      marginBottom: 6,
      fontWeight: '500',
    },
    link: {
      fontSize: 13,
      color: '#5a67d8',
    },
    loginButton: {
      backgroundColor: '#5a67d8',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
    },
    loginButtonText: {
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
      borderColor: '#ccc',
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
    registerLink: {
      color: '#5a67d8',
      fontWeight: '600',
    },
    loginErrorText: {
      fontSize: 14,
      color: 'red',
      textAlign: 'center',
      marginBottom: 10,
    },
  });
  
export default LoginScreen;

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CONFIG, FACEBOOK_CONFIG, API_URL } from '../../config/auth.config';
import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const useProxy = true;

const AuthButtons = ({ onAuthSuccess }) => {
  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig.scheme,
        path: 'auth/google/callback',
        useProxy
      });

      const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}&platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const data = params.get('data');

        if (data) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(data));
            if (decodedData.token && decodedData.user) {
              await AsyncStorage.setItem('userToken', decodedData.token);
              await AsyncStorage.setItem('userData', JSON.stringify(decodedData.user));
              onAuthSuccess(decodedData);
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
            Alert.alert('Помилка', 'Не вдалося обробити дані авторизації');
          }
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Помилка', 'Не вдалося виконати вхід через Google');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig.scheme,
        path: 'auth/facebook/callback',
        useProxy
      });

      const authUrl = `${API_URL}/auth/facebook?redirect_uri=${encodeURIComponent(redirectUri)}&platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const data = params.get('data');

        if (data) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(data));
            if (decodedData.token && decodedData.user) {
              await AsyncStorage.setItem('userToken', decodedData.token);
              await AsyncStorage.setItem('userData', JSON.stringify(decodedData.user));
              onAuthSuccess(decodedData);
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
            Alert.alert('Помилка', 'Не вдалося обробити дані авторизації');
          }
        }
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      Alert.alert('Помилка', 'Не вдалося виконати вхід через Facebook');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <FontAwesome name="google" size={20} color="red" />
        <Text style={styles.socialText}>Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleFacebookLogin}>
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialText}>Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthButtons; 
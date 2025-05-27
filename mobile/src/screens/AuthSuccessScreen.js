import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthSuccessScreen = ({ navigation, route }) => {
  useEffect(() => {
    const processAuthData = async () => {
      try {
        const { data } = route.params || {};
        
        if (data) {
          const authData = JSON.parse(decodeURIComponent(data));
   
          await AsyncStorage.setItem('userToken', authData.token);
          await AsyncStorage.setItem('userData', JSON.stringify(authData.user));

          navigation.replace('Main');
        } else {
          // Якщо немає даних, переходимо на логін
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error processing auth success:', error);
        navigation.replace('Login');
      }
    };

    processAuthData();
  }, [navigation, route.params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5a67d8" />
      <Text style={styles.text}>Завершення авторизації...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default AuthSuccessScreen;
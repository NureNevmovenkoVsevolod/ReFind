import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MainScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData'); 
      console.log('Вихід успішний, дані користувача видалено.');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Hello' }],
      });
    } catch (e) {
      console.error('Помилка при виході', e);
      Alert.alert('Помилка', 'Не вдалося вийти з облікового запису.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Ласкаво просимо на головну сторінку!</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Вийти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff6347', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen; 
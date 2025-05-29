import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardAdvertisement from '../components/CardAdvertisement';

const DEFAULT_AVATAR = 'https://via.placeholder.com/100x100.png?text=User';
const API_URL = 'https://refind-wm5m.onrender.com/api/advertisement/user/my';

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('userData');
      setUser(userData ? JSON.parse(userData) : null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      setAdsLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAds(Array.isArray(data) ? data : []);
      } catch (e) {
        setAds([]);
      } finally {
        setAdsLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Hello' }],
      });
    } catch (e) {
      console.error('Помилка при виході', e);
      Alert.alert('Помилка', 'Не вдалося вийти з облікового запису.');
    }
  };

  const renderAd = ({ item }) => (
    <CardAdvertisement item={item} onPress={() => {}} />
  );

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.user_pfp || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user.first_name || 'Користувач'}</Text>
            {user.last_name ? <Text style={styles.lastName}>{user.last_name}</Text> : null}
            {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
          </View>
          <Text style={styles.sectionTitle}>Мої оголошення</Text>
          {adsLoading ? (
            <ActivityIndicator size="large" color="#5a67d8" style={{ marginTop: 20 }} />
          ) : ads.length === 0 ? (
            <Text style={styles.noAds}>У вас ще немає оголошень</Text>
          ) : (
            <FlatList
              data={ads}
              renderItem={renderAd}
              keyExtractor={item => item.advertisement_id?.toString() || item.id?.toString() || Math.random().toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      ) : (
        <ActivityIndicator size="large" color="#5a67d8" />
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Вийти</Text>
      </TouchableOpacity>
      <BottomNavBar activeScreen="Profile" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  lastName: {
    fontSize: 18,
    color: '#555',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 20,
    color: '#333',
  },
  noAds: {
    color: '#888',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
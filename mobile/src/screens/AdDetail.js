import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200.png?text=No+Image';

const AdDetail = ({ route, navigation }) => {
  const item = route.params?.item;
  if (!item) {
    return (
      <View style={styles.centered}><Text>Оголошення не знайдено</Text></View>
    );
  }
  const getMainImage = () => {
    if (item.Images && item.Images.length > 0) {
      return item.Images[0].image_url;
    }
    return DEFAULT_IMAGE;
  };
  const handleBack = () => navigation.goBack();
  const handleCall = () => item.phone && Linking.openURL(`tel:${item.phone}`);
  const handleEmail = () => item.email && Linking.openURL(`mailto:${item.email}`);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: getMainImage() }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.row}>
            <View style={styles.categoryBadge}>
              <MaterialIcons name="category" size={16} color="#fff" />
              <Text style={styles.categoryText}>{item.categorie_name || 'Інше'}</Text>
            </View>
            <View style={[styles.statusBadge, {backgroundColor: item.type === 'lost' ? '#ff6b6b' : '#51cf66'}]}>
              <Text style={styles.statusText}>{item.type === 'lost' ? 'Загублено' : 'Знайдено'}</Text>
            </View>
          </View>
          {item.reward > 0 && (
            <View style={styles.rewardBlock}>
              <MaterialIcons name="monetization-on" size={20} color="#f39c12" />
              <Text style={styles.rewardText}>Винагорода: {item.reward} грн</Text>
            </View>
          )}
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#5a67d8" />
            <Text style={styles.infoText}>{item.location_description}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#5a67d8" />
            <Text style={styles.infoText}>{item.type === 'lost' ? 'Загублено: ' : 'Знайдено: '}{item.incident_date || item.createdAt}</Text>
          </View>
          {(item.phone || item.email) && (
            <View style={styles.contactBlock}>
              <Text style={styles.contactTitle}>Контакти</Text>
              {item.phone && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                  <FontAwesome name="phone" size={18} color="#fff" />
                  <Text style={styles.contactBtnText}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              {item.email && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                  <MaterialIcons name="email" size={18} color="#fff" />
                  <Text style={styles.contactBtnText}>{item.email}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNavBar activeScreen={null} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 260,
    position: 'relative',
    marginBottom: -40,
    zIndex: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: '#eaeaea',
  },
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: -32,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5a67d8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rewardBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    marginTop: 2,
    gap: 6,
  },
  rewardText: {
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: 15,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
  },
  contactBlock: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#f4f8ff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  contactTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3b4a6b',
    marginBottom: 8,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5a67d8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 4,
    gap: 8,
  },
  contactBtnText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdDetail; 
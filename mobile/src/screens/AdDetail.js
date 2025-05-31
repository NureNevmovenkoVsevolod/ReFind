import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200.png?text=No+Image';
const SCREEN_WIDTH = Dimensions.get('window').width;

const AdDetail = ({ route, navigation }) => {
  const item = route.params?.item;
  const [activeImage, setActiveImage] = useState(0);
  if (!item) {
    return (
      <View style={styles.centered}><Text>Оголошення не знайдено</Text></View>
    );
  }
  const images = item.Images && item.Images.length > 0 ? item.Images.map(img => img.image_url) : [DEFAULT_IMAGE];
  const handleBack = () => navigation.goBack();
  const handleCall = () => (item.phone || item.phone_number) && Linking.openURL(`tel:${item.phone || item.phone_number}`);
  const handleEmail = () => item.email && Linking.openURL(`mailto:${item.email}`);

  // Форматування дати
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.protoContainer}>
      {/* Header */}
      <View style={styles.protoHeader}>
        <TouchableOpacity style={styles.protoHeaderBackBtn} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.protoHeaderTitle} numberOfLines={2}>{item.title}</Text>
      </View>
      {/* Галерея фото */}
      <View style={styles.protoGalleryWrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
            setActiveImage(index);
          }}
          scrollEventThrottle={16}
        >
          {images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={styles.protoGalleryImage}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
        {/* Індикатор сторінок */}
        <View style={styles.protoGalleryIndicator}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[styles.protoGalleryDot, activeImage === idx && styles.protoGalleryDotActive]}
            />
          ))}
        </View>
      </View>
      {/* Основна картка */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.protoCardScroll}>
        <View style={styles.protoCard}>
          <View style={styles.protoTitleRow}>
            <Text style={styles.protoTitle}>{item.title}</Text>
            <View style={[styles.protoStatusBadge, {backgroundColor: item.type === 'lost' ? '#fff0f0' : '#e6f9ed'}]}>
              <Text style={[styles.protoStatusText, {color: item.type === 'lost' ? '#ff6b6b' : '#51cf66'}]}>{item.type === 'lost' ? 'Загублено' : 'Знайдено'}</Text>
            </View>
          </View>
          {/* Дата, місце, час */}
          <View style={styles.protoInfoBlock}>
            {item.incident_date && (
              <View style={styles.protoInfoRow}>
                <MaterialIcons name="event" size={20} color="#5a67d8" style={{marginRight: 8}} />
                <Text style={styles.protoInfoText}>Знайдено: {formatDate(item.incident_date)}</Text>
              </View>
            )}
            {item.location_description && (
              <View style={styles.protoInfoRow}>
                <MaterialIcons name="location-on" size={20} color="#5a67d8" style={{marginRight: 8}} />
                <Text style={styles.protoInfoText}>{item.location_description}</Text>
              </View>
            )}
            {item.time && (
              <View style={styles.protoInfoRow}>
                <MaterialIcons name="access-time" size={20} color="#5a67d8" style={{marginRight: 8}} />
                <Text style={styles.protoInfoText}>Приблизно о {item.time}</Text>
              </View>
            )}
          </View>
          {/* Опис */}
          <View style={styles.protoDescBlock}>
            <Text style={styles.protoDescTitle}>Опис</Text>
            <Text style={styles.protoDescText}>{item.description}</Text>
          </View>
          {/* Інформація про того, хто знайшов */}
          <View style={styles.protoFinderBlock}>
            <Text style={styles.protoFinderTitle}>Інформація про того, хто {item.type === 'lost' ? 'загубив' : "знайшов"}</Text>
            <View style={styles.protoFinderRow}>
              <Image
                source={{ uri: (item.User && item.User.user_pfp) || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.protoFinderAvatar}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.protoFinderName}>{item.User ? `${item.User.first_name || ''} ${item.User.last_name || ''}`.trim() : 'Користувач'}</Text>
                <View style={styles.protoFinderRatingRow}>
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={styles.protoFinderRatingText}>{item.finder_rating || '4.5'}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.protoMainBtn}>
              <MaterialIcons name="check-circle" size={22} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.protoMainBtnText}>Це моя річ</Text>
            </TouchableOpacity>
            <View style={styles.protoFinderBtnsRow}>
              {item.email && 
              <TouchableOpacity style={styles.protoFinderBtn} onPress={handleEmail}>
                <MaterialIcons name="chat" size={20} color="#5a67d8" />
                <Text style={styles.protoFinderBtnText}>Написати</Text>
              </TouchableOpacity>
              }
              <TouchableOpacity style={styles.protoFinderBtn} onPress={handleCall}>
                <FontAwesome name="phone" size={20} color="#5a67d8" />
                <Text style={styles.protoFinderBtnText}>Зателефонувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavBar activeScreen={null} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  protoContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginBlock:15
  },
  protoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  protoHeaderBackBtn: {
    marginRight: 10,
    padding: 4,
    borderRadius: 20,
  },
  protoHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#23272f',
    textAlign: 'center',
    marginRight: 34,
  },
  protoGalleryWrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  protoGalleryImage: {
    width: Dimensions.get('window').width - 48,
    height: 250,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#eaeaea',
    resizeMode: 'contain',
  },
  protoGalleryIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  protoGalleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 3,
  },
  protoGalleryDotActive: {
    backgroundColor: '#5a67d8',
  },
  protoCardScroll: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  protoCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  protoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  protoTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#23272f',
    marginRight: 8,
  },
  protoStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  protoStatusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  protoInfoBlock: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    marginTop: 2,
  },
  protoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  protoInfoText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  protoDescBlock: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  protoDescTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#5a67d8',
    marginBottom: 6,
  },
  protoDescText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 21,
  },
  protoFinderBlock: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  protoFinderTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#23272f',
    marginBottom: 10,
  },
  protoFinderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  protoFinderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eaeaea',
  },
  protoFinderName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#23272f',
  },
  protoFinderRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  protoFinderRatingText: {
    fontSize: 15,
    color: '#23272f',
    marginLeft: 4,
    marginRight: 8,
  },
  protoMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5a67d8',
    borderRadius: 10,
    paddingVertical: 13,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  protoMainBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  protoFinderBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
  },
  protoFinderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5a67d8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  protoFinderBtnText: {
    color: '#5a67d8',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdDetail; 
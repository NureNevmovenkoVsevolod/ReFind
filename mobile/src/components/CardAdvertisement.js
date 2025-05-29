import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const CardAdvertisement = ({ item, onPress, navigation }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusText = (type) => {
    return type === 'lost' ? 'Загублено' : 'Знайдено';
  };

  const getStatusColor = (type) => {
    return type === 'lost' ? '#ff6b6b' : '#51cf66';
  };

  const getMainImage = () => {
    if (item.Images && item.Images.length > 0) {
      return item.Images[0].image_url;
    }
    return 'https://via.placeholder.com/100x100.png?text=No+Image';
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation && navigation.navigate('AdvertisementDetail', { item })}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: getMainImage() }} 
        style={styles.image}
        defaultSource={{ uri: 'https://via.placeholder.com/100x100.png?text=No+Image' }}
      />
      
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {truncateText(item.title, 30)}
          </Text>
          <Text 
            style={[styles.status, { color: getStatusColor(item.type) }]}
          >
            {getStatusText(item.type)}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {truncateText(item.description, 60)}
        </Text>

        <Text style={styles.date}>
          {item.type === 'lost' ? 'Загублено: ' : 'Знайдено: '}
          {item.incident_date ? formatDate(item.incident_date) : formatDate(item.createdAt)}
        </Text>

        <View style={styles.locationContainer}>
          <MaterialIcons
            name="location-on"
            size={16}
            color="#666"
            style={styles.icon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {truncateText(item.location_description, 40)}
          </Text>
        </View>

        <View style={styles.categoryContainer}>
          <MaterialIcons
            name="category"
            size={16}
            color="#666"
            style={styles.icon}
          />
          <Text style={styles.categoryText}>
            {item.categorie_name || 'Інше'}
          </Text>
        </View>

        {item.reward > 0 && (
          <View style={styles.rewardContainer}>
            <MaterialIcons
              name="monetization-on"
              size={16}
              color="#f39c12"
              style={styles.icon}
            />
            <Text style={styles.rewardText}>
              Винагорода: {item.reward} грн
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f5f5f5',
  },
  details: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  rewardText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
  },
});

export default CardAdvertisement;
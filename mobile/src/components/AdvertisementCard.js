import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";

const AdvertisementCard = ({ item }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.status}>Знайдено</Text>
        </View>
        <Text style={styles.date}>Знайдено: {item.date}</Text>
        <View style={styles.locationContainer}>
        <MaterialIcons
          name="location-pin"
          size={20}
          color="#999"
          style={styles.icon}
        />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.finderContainer}>
        <MaterialIcons
          name="person"
          size={20}
          color="#999"
          style={styles.icon}
        />
          <Text style={styles.finderName}>{item.finder}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 10,
  },
  status: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#555',
  },
  finderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finderIcon: {
    marginRight: 5,
  },
  finderName: {
    fontSize: 12,
    color: '#555',
  },
});

export default AdvertisementCard; 
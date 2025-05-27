import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const BottomNavBar = ({ activeScreen, navigation }) => {
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navBarItem} onPress={() => navigateTo('Main')}>
        <FontAwesome 
          name="home" 
          size={24} 
          color={activeScreen === 'Main' ? '#5a67d8' : '#888'} 
        />
        <Text style={activeScreen === 'Main' ? styles.navBarItemTextActive : styles.navBarItemText}>Головна</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navBarItem} onPress={() => navigateTo('Map')}>
        <FontAwesome 
          name="map-marker" 
          size={24} 
          color={activeScreen === 'Map' ? '#5a67d8' : '#888'} 
        />
        <Text style={activeScreen === 'Map' ? styles.navBarItemTextActive : styles.navBarItemText}>Карта</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navBarItem} onPress={() => navigateTo('Profile')}>
        <FontAwesome 
          name="user" 
          size={24} 
          color={activeScreen === 'Profile' ? '#5a67d8' : '#888'} 
        />
        <Text style={activeScreen === 'Profile' ? styles.navBarItemTextActive : styles.navBarItemText}>Профіль</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 75,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 5, 
  },
  navBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarItemText: {
    fontSize: 12,
    color: '#888',
  },
  navBarItemTextActive: {
    fontSize: 12,
    color: '#5a67d8',
    fontWeight: 'bold',
  },
});

export default BottomNavBar; 
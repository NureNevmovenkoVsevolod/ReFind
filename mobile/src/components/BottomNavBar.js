import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

const BottomNavBar = ({ activeScreen, navigation }) => {
  const insets = useSafeAreaInsets();
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }}>
      <View style={[
        styles.navBar,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 20 : 8),
          height: 65 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 20 : 8)),
        }
      ]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navBarItemText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  navBarItemTextActive: {
    fontSize: 12,
    color: '#5a67d8',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default BottomNavBar; 
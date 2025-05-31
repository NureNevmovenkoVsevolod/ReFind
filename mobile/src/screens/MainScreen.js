import React, { useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, Text, TouchableOpacity } from "react-native";
import { useRoute } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import CategoryFilter from '../components/CategoryFilter';
import AdvertisementSection from '../components/AdvertisementSection';
import SearchInput from "../components/SearchInput";

function MainScreen({ navigation }) {
  const route = useRoute();
  const activeScreen = route.name;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Дебаунс для пошукового запиту (затримка 500мс)
  const debouncedSearch = useCallback((value) => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(value.toLowerCase().trim());
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
    // Дебаунс реалізований через useCallback і setTimeout
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(text.toLowerCase().trim());
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  const handleAdvertisementPress = useCallback((advertisement) => {
    // Навігація до детальної сторінки оголошення
    navigation.navigate('AdvertisementDetail', { 
      advertisementId: advertisement.advertisement_id 
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <SearchInput 
          placeholder="Введіть локацію, назву або опис"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClear={handleClearSearch}
        />
        <CategoryFilter onSelectCategory={handleCategorySelect} />
      </View>
      
      <AdvertisementSection 
        selectedCategoryId={selectedCategoryId}
        searchQuery={debouncedSearchQuery}
        navigation={navigation}
        onAdvertisementPress={handleAdvertisementPress}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          navigation.navigate('CreateAdvertisement', { type: 'find' }); // Навігація на екран створення оголошення для знайдених речей
        }}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
      
      <BottomNavBar activeScreen={activeScreen} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  createButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#5a67d8',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
});

export default MainScreen;
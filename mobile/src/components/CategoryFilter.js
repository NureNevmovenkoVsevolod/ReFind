import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiUrl = Constants.expoConfig.extra.API_URL;

const CategoryFilter = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategoryName, setActiveCategoryName] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get(`${apiUrl}/api/categories`, config);
        const formattedCategories = response.data.map(cat => ({ _id: cat._id, name: cat.categorie_name }));
        setCategories([{ _id: 'all-filter-option', name: 'All' }, ...formattedCategories]);
        setActiveCategoryName('All');
      } catch (error) {
        console.error('Помилка при отриманні категорій:', error);
        if (error.response && error.response.status === 401) {
          Alert.alert('Авторизація', 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.');
        } else {
          Alert.alert('Помилка', 'Не вдалося завантажити категорії.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSelectCategory = (category) => {
    const categoryId = category._id === 'all-filter-option' ? null : category._id;
    setActiveCategoryName(category.name);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#5a67d8" />
        <Text>Завантаження категорій...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.categoryButton,
              activeCategoryName === category.name && styles.activeCategoryButton,
            ]}
            onPress={() => handleSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                activeCategoryName === category.name && styles.activeCategoryButtonText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 0,
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeCategoryButton: {
    backgroundColor: '#5a67d8',
  },
  categoryButtonText: {
    color: '#333',
    fontSize: 14,
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategoryFilter; 
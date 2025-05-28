import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from '../components/BottomNavBar';
import CategoryFilter from '../components/CategoryFilter';
import { useRoute } from '@react-navigation/native';
import OurTextInput from "../components/OurTextInput";
import AdvertisementCard from "../components/AdvertisementCard";
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig.extra.API_URL;
const ITEMS_PER_PAGE = 8; // Встановлюємо кількість оголошень на сторінку, відповідно до контролера

function MainScreen({ navigation }) {
  const route = useRoute();
  const activeScreen = route.name;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAdvertisements = useCallback(async (currentPage, categoryId) => {
    if (currentPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      let url = `${API_BASE_URL}/api/advertisements/all?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
      if (categoryId) {
        url = `${url}&category=${categoryId}`;
      }
      const response = await axios.get(url);
      
      if (currentPage === 1) {
        setAdvertisements(response.data.items || []);
      } else {
        setAdvertisements(prevAds => [...prevAds, ...(response.data.items || [])]);
      }
      setHasMore(response.data.hasMore);
    } catch (e) {
      console.error("Failed to fetch advertisements:", e);
      setError("Не вдалося завантажити оголошення.");
      if (currentPage === 1) setAdvertisements([]);
    } finally {
      if (currentPage === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []); // Залежності порожні, оскільки функції set... стабільні

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAdvertisements(1, selectedCategoryId);
  }, [selectedCategoryId, fetchAdvertisements]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    // Завантаження для нової категорії буде запущено через useEffect
  };

  const loadMoreAdvertisements = () => {
    if (hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAdvertisements(nextPage, selectedCategoryId);
    }
  };

  const renderAdvertisement = ({ item }) => (
    // Передача item до компонента картки
    <AdvertisementCard item={item} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Завантаження оголошень...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OurTextInput icon="search" placeholder="Введіть локацію, назву або опис"></OurTextInput>
      <CategoryFilter onSelectCategory={handleCategorySelect} />
      {advertisements.length > 0 ? (
        <FlatList
          data={advertisements}
          renderItem={renderAdvertisement}
          keyExtractor={(item, index) => item.advertisement_id ? item.advertisement_id.toString() : index.toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreAdvertisements}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Оголошень не знайдено.</Text>
        </View>
      )}
      <BottomNavBar activeScreen={activeScreen} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20
  },
  listContent: {
    paddingHorizontal: 20, // Відступи з боків для FlatList
    paddingBottom: 80, // Забезпечити відступ знизу для BottomNavBar
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#ff6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#555',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ced0ce',
  },
});

export default MainScreen;

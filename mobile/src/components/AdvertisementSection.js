import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardAdvertisement from './CardAdvertisement';

const apiUrl = Constants.expoConfig.extra.API_URL;

const AdvertisementSection = ({ selectedCategoryId, searchQuery, onAdvertisementPress }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAdvertisements = useCallback(async (page = 1, isRefresh = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Помилка', 'Токен авторизації не знайдено');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page,
          limit: 8,
          ...(selectedCategoryId && { category: selectedCategoryId }),
          ...(searchQuery && { search: searchQuery })
        }
      };

      const response = await axios.get(`${apiUrl}/api/advertisement/all`, config);
      const { items, totalPages: total, hasMore: more } = response.data;

      if (page === 1 || isRefresh) {
        setAdvertisements(items);
      } else {
        setAdvertisements(prev => [...prev, ...items]);
      }

      setTotalPages(total);
      setHasMore(more);
      setCurrentPage(page);

    } catch (error) {
      console.error('Помилка при завантаженні оголошень:', error);
      if (error.response?.status === 401) {
        Alert.alert('Авторизація', 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.');
      } else {
        Alert.alert('Помилка', 'Не вдалося завантажити оголошення');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategoryId, searchQuery]);

  useEffect(() => {
    fetchAdvertisements(1, true);
  }, [fetchAdvertisements]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchAdvertisements(1, true);
  }, [fetchAdvertisements]);

  const loadMoreAdvertisements = useCallback(() => {
    if (!loadingMore && hasMore && currentPage < totalPages) {
      fetchAdvertisements(currentPage + 1);
    }
  }, [loadingMore, hasMore, currentPage, totalPages, fetchAdvertisements]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#5a67d8" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery || selectedCategoryId 
            ? 'Оголошень за вашим запитом не знайдено' 
            : 'Оголошень поки немає'}
        </Text>
      </View>
    );
  };

  if (loading && advertisements.length === 0) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#5a67d8" />
        <Text style={styles.loadingText}>Завантаження оголошень...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Оголошення</Text>
        <Text style={styles.count}>
          {advertisements.length >= 0 ? `Знайдено: ${advertisements.length}` : ''}
        </Text>
      </View>
      
      <FlatList
        data={advertisements}
        keyExtractor={(item) => item.advertisement_id.toString()}
        renderItem={({ item }) => (
          <CardAdvertisement 
            item={item} 
            onPress={onAdvertisementPress}
          />
        )}
        onEndReached={loadMoreAdvertisements}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5a67d8']}
            tintColor="#5a67d8"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={advertisements.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdvertisementSection;
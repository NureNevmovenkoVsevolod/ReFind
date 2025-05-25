import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './Board.module.css';
import LossCard from '../components/LossCard/LossCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ITEMS_PER_PAGE = 100;
const DEFAULT_CATEGORY = { value: 'all', label: 'All categories' };

const BoardFound = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);

  const apiUrl = useMemo(() => process.env.REACT_APP_SERVER_URL, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: ITEMS_PER_PAGE };
      const response = await axios.get(`${apiUrl}/api/advertisement/finds`, { params });
      const advertisements = Array.isArray(response.data.items)
        ? response.data.items
        : response.data.advertisements || [];
      setItems(advertisements);
      setFilteredItems(advertisements);
    } catch (err) {
      setError(err.message || 'Failed to fetch advertisements');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/categories`);
      const fetchedCategories = response.data.map(cat => ({
        value: String(cat.categorie_id),
        label: cat.categorie_name
      }));
      setCategories([DEFAULT_CATEGORY, ...fetchedCategories]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);

  const handleSearch = useCallback(() => {
    let filtered = [...items];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        String(item.categorie_id) === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title?.toLowerCase().includes(query)) ||
        (item.description?.toLowerCase().includes(query)) ||
        (item.location_description?.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery, sortOrder]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const formatDate = useCallback((date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <h2>Error loading advertisements</h2>
          <p>{error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className={styles.noResults}>
          <h3>No items found matching your criteria</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      );
    }

    return filteredItems.map(item => (
      <LossCard
        key={item.advertisement_id}
        advertisement_id={item.advertisement_id}
        image={item.Images?.[0]?.image_url}
        date={formatDate(item.incident_date)}
        title={item.title}
        description={item.description}
        cityName={item.location_description}
        categoryName={item.categorie_name || 'Other'}
      />
    ));
  }, [isLoading, error, filteredItems, formatDate, fetchData]);

  return (
    <div className={styles.boardPage}>
      <div className={styles.contentWrapper}>
        <button 
          className={styles.backBtn} 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <span>←</span> Back
        </button>
        
        <h1 className={styles.title}>Board Found</h1>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              placeholder="Search by name, description or location..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search input"
            />
            
            <select
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Category select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <select
              className={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort order select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <h2 className={styles.subtitle}>Relevant finds according to your criteria</h2>
        
        <div className={styles.cardsContainer}>
          {renderContent}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BoardFound);

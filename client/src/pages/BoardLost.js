import React, { useState, useEffect } from 'react';
import styles from './Board.module.css';
import LossCard from '../components/LossCard/LossCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgcard from '../assets/photo.png';

const BoardLost = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([{ value: 'all', label: 'All categories' }]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          page: 1,
          limit: 100,
        };
        const response = await axios.get(process.env.REACT_APP_SERVER_URL+"/api/advertisement/losses", { params });
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
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_SERVER_URL+"/api/categories");
        const cats = res.data.map(cat => ({ value: String(cat.categorie_id), label: cat.categorie_name }));
        setCategories([{ value: 'all', label: 'All categories' }, ...cats]);
      } catch (e) {
        // fallback: do nothing, keep default
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = () => {
    let filtered = [...items];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        String(item.categorie_id) === selectedCategory
      );
    }

    // Filter by search query (title, description, location)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.location_description && item.location_description.toLowerCase().includes(query))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    setFilteredItems(filtered);
  };

  // Update filtered items whenever search parameters change
  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory, sortOrder]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading advertisements</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.boardPage}>
      <div className={styles.contentWrapper}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>
        
        <h1 className={styles.title}>Board Lost</h1>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              placeholder="Search by name, description or location..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <h2 className={styles.subtitle}>Actual losses according to your criteria</h2>
        
        <div className={styles.cardsContainer}>
          {isLoading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <LossCard
                key={item.advertisement_id}
                advertisement_id={item.advertisement_id}
                image={item.Images?.[0]?.image_url ? `${process.env.REACT_APP_SERVER_URL}/static${item.Images[0].image_url}` : undefined}
                date={item.incident_date ? new Date(item.incident_date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                title={item.title}
                description={item.description}
                cityName={item.location_description}
                categoryName={item.categorie_name || 'Other'}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No items found matching your criteria</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardLost;

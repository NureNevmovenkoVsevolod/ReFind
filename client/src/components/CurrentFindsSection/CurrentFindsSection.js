import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { CategoryFilter } from "./CategoryFilter";
import FindCard from "../FindCard/FindCard";
import ShowMoreButton from "../ShowMoreButton/ShowMoreButton";
import styles from "./CurrentFindsSection.module.css";
import axios from "axios";

function CurrentFindsSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [finds, setFinds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFinds = async (pageNum = 1, category = selectedCategory) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 8,
        ...(category && { category }),
      };

      const response = await axios.get(
        "http://localhost:5000/api/advertisement/finds",
        {
          params,
        }
      );

      if (pageNum === 1) {
        setFinds(response.data.items);
      } else {
        setFinds((prev) => [...prev, ...response.data.items]);
      }

      setHasMore(response.data.items.length === 8);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching finds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinds(1);
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchFinds(1, category);
  };

  const handleShowMore = () => {
    if (!loading && hasMore) {
      fetchFinds(page + 1);
    }
  };

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Found Items</h2>
      <CategoryFilter onCategoryChange={handleCategoryChange} />
      <Row className={styles.findsGrid}>
        {finds.map((find) => (
          <Col
            key={find.advertisement_id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            className={styles.cardCol}
          >
            <FindCard
              image={find.images?.[0]?.image_url}
              date={new Date(find.created_at).toLocaleDateString()}
              cityName={find.city}
              categoryName={find.categorie_name}
            />
          </Col>
        ))}
      </Row>
      {hasMore && <ShowMoreButton loading={loading} onClick={handleShowMore} />}
    </Container>
  );
}

export default CurrentFindsSection;

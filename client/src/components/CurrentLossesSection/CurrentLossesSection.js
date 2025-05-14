import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { CategoryFilter } from "../CurrentFindsSection/CategoryFilter";
import LossCard from "../LossCard/LossCard";
import ShowMoreButton from "../ShowMoreButton/ShowMoreButton";
import styles from "../CurrentFindsSection/CurrentFindsSection.module.css";
import axios from "axios";

function CurrentLossesSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLosses = async (pageNum = 1, category = selectedCategory) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 8,
        ...(category && { category }),
      };

      const response = await axios.get(
        "http://localhost:5000/api/advertisement/losses",
        {
          params,
        }
      );

      if (pageNum === 1) {
        setLosses(response.data.items);
      } else {
        setLosses((prev) => [...prev, ...response.data.items]);
      }

      setHasMore(response.data.items.length === 8);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching losses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLosses(1);
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchLosses(1, category);
  };

  const handleShowMore = () => {
    if (!loading && hasMore) {
      fetchLosses(page + 1);
    }
  };

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Lost Items</h2>
      <CategoryFilter onCategoryChange={handleCategoryChange} />
      <Row className={styles.findsGrid}>
        {losses.map((loss) => (
          <Col
            key={loss.advertisement_id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            className={styles.cardCol}
          >
            <LossCard
              image={loss.images?.[0]?.image_url}
              date={new Date(loss.created_at).toLocaleDateString()}
              cityName={loss.city}
              categoryName={loss.categorie_name}
              name={loss.title}
              description={loss.description}
            />
          </Col>
        ))}
      </Row>
      {hasMore && <ShowMoreButton loading={loading} onClick={handleShowMore} />}
    </Container>
  );
}

export default CurrentLossesSection;

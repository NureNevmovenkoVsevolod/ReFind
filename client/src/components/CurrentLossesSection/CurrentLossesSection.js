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

      console.log("Fetching losses with params:", params);

      const response = await axios.get(
        "http://localhost:5000/api/advertisement/losses",
        {
          params,
        }
      );

      console.log("Received response:", response.data);

      if (pageNum === 1) {
        setLosses(response.data.items || []);
      } else {
        setLosses((prev) => [...prev, ...(response.data.items || [])]);
      }

      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching losses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial fetch");
    fetchLosses(1);
  }, []);

  const handleCategoryChange = (category) => {
    console.log("Category changed to:", category);
    setSelectedCategory(category);
    setPage(1);
    fetchLosses(1, category);
  };

  const handleShowMore = () => {
    if (!loading && hasMore) {
      console.log("Loading more items, current page:", page);
      fetchLosses(page + 1);
    }
  };

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Current Losses</h2>
      <CategoryFilter onCategoryChange={handleCategoryChange} />
      <Row className={styles.findsGrid}>
        {losses && losses.length > 0 ? (
          losses.map((loss) => (
            <Col
              key={loss.advertisement_id}
              xs={12}
              sm={12}
              md={12}
              lg={12}
              className={styles.cardCol}
            >
              {" "}
              <LossCard
                  advertisement_id={loss.advertisement_id}
                image={
                  loss.Images?.[0]?.image_url
                    ? `http://localhost:5000/static${loss.Images[0].image_url}`
                    : undefined
                }
                date={new Date(loss.incident_date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                title={loss.title}
                cityName={loss.location_description}
                categoryName={loss.Category?.categorie_name || "Other"}
                description={loss.description}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <p className="text-center">Currently, there are no lost items</p>
          </Col>
        )}
      </Row>
      {hasMore && <ShowMoreButton loading={loading} onClick={handleShowMore} />}
    </Container>
  );
}

export default CurrentLossesSection;

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
      console.log("Fetching with category:", category);
      const params = {
        page: pageNum,
        limit: 8,
        ...(category && { category }),
      };

      console.log("Fetching finds with params:", params);

      const response = await axios.get(
        process.env.REACT_APP_SERVER_URL+"/api/advertisement/finds",
        {
          params,
        }
      );

      console.log("Received response:", response.data);

      if (pageNum === 1) {
        setFinds(response.data.items || []);
      } else {
        setFinds((prev) => [...prev, ...(response.data.items || [])]);
      }

      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching finds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial fetch");
    fetchFinds(1);
  }, []);
  const handleCategoryChange = (category) => {
    console.log("Category changed to:", category);
    setSelectedCategory(category);
  };

  useEffect(() => {
    setPage(1);
    fetchFinds(1, selectedCategory);
  }, [selectedCategory]);

  const handleShowMore = () => {
    if (!loading && hasMore) {
      console.log("Loading more items, current page:", page);
      fetchFinds(page + 1);
    }
  };
  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Current Finds</h2>
      <CategoryFilter onCategoryChange={handleCategoryChange} />
      <Row className={styles.findsGrid}>
        {finds && finds.length > 0 ? (
          finds.map((find) => (
            <Col
              key={find.advertisement_id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className={styles.cardCol}
            >
              {" "}
              <FindCard
                  advertisement_id={find.advertisement_id}
                image={
                  find.Images?.[0]?.image_url
                    ? `${find.Images[0].image_url}`
                    : undefined
                }
                date={new Date(find.incident_date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                title={find.title}
                cityName={find.location_description}
                categoryName={find.categorie_name || "Other"}
                description={find.description}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <p className="text-center">No items found so far</p>
          </Col>
        )}
      </Row>
      {hasMore && <ShowMoreButton loading={loading} onClick={handleShowMore} />}
    </Container>
  );
}

export default CurrentFindsSection;

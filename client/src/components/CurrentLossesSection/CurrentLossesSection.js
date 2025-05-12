import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../CurrentFindsSection/CurrentFindsSection.module.css";
import { CategoryFilter } from "../CurrentFindsSection/CategoryFilter";
import LossCard from "../LossCard/LossCard";
import ShowMoreButton from "../ShowMoreButton/ShowMoreButton";

// Example data for loss cards
const allLossItems = [
  {
    id: 1,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 2,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    id: 3,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 4,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  // Additional items that will appear after "Show more"
  {
    id: 5,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 6,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 7,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 8,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City",
    categoryName: "Category name",
    name: "Name",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
];

function CurrentLossesSection() {
  // Initially show only 4 cards
  const [visibleItems, setVisibleItems] = useState(4);
  const [loading, setLoading] = useState(false);

  // Array of items currently displayed
  const currentItems = allLossItems.slice(0, visibleItems);

  // Check if there are more items to show
  const hasMoreItems = visibleItems < allLossItems.length;

  // Function to load more items
  const loadMoreItems = () => {
    // Simulating loading (can be replaced with a real API request)
    setLoading(true);

    setTimeout(() => {
      setVisibleItems((prevVisible) =>
        Math.min(prevVisible + 4, allLossItems.length)
      );
      setLoading(false);
    }, 500); // Small delay to simulate loading
  };

  return (
    <Container className={styles.container}>
      <Row className="d-flex justify-content-center">
        <h2 className={`${styles.title} text-center`}>Current Losses</h2>
      </Row>
      <CategoryFilter />

      <Row>
        {currentItems.map((item) => (
          <Col key={item.id} xs={12} className="mb-4">
            <LossCard
              image={item.image}
              date={item.date}
              cityName={item.cityName}
              categoryName={item.categoryName}
              name={item.name}
              description={item.description}
            />
          </Col>
        ))}
      </Row>

      {hasMoreItems && (
        <ShowMoreButton loading={loading} onClick={loadMoreItems} />
      )}
    </Container>
  );
}

export default CurrentLossesSection;

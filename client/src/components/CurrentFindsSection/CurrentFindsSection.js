import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "./CurrentFindsSection.module.css";
import { CategoryFilter } from "./CategoryFilter";
import FindCard from "../FindCard/FindCard";

// Приклад даних для карток знахідок
const allFindItems = [
  {
    id: 1,
    image: "/path-to-plush-toy.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 2,
    image: "/path-to-glasses.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 3,
    image: "/path-to-plush-toy.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 4,
    image: "/path-to-wallet.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 5,
    image: "/path-to-glasses.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 6,
    image: "/path-to-wallet.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 7,
    image: "/path-to-glasses.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 8,
    image: "/path-to-wallet.jpg", // Заміни на правильний шлях до зображення
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  // Наступні 8 карток, які з'являться після натискання "Show more"
  {
    id: 9,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 10,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 11,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 12,
    image: "/path-to-wallet.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 13,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 14,
    image: "/path-to-wallet.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 15,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 16,
    image: "/path-to-plush-toy.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 17,
    image: "/path-to-wallet.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 18,
    image: "/path-to-glasses.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
  {
    id: 19,
    image: "/path-to-wallet.jpg",
    date: "01.01.2025",
    cityName: "City Name",
    categoryName: "Category name",
  },
];

function CurrentFindsSection() {
  // Початково показувати тільки 8 карток
  const [visibleItems, setVisibleItems] = useState(8);
  const [loading, setLoading] = useState(false);

  // Масив елементів, які відображаються зараз
  const currentItems = allFindItems.slice(0, visibleItems);

  // Перевірка, чи є ще елементи для показу
  const hasMoreItems = visibleItems < allFindItems.length;

  // Функція для завантаження більше елементів
  const loadMoreItems = () => {
    // Імітація завантаження (можна замінити на реальний запит до API)
    setLoading(true);

    setTimeout(() => {
      setVisibleItems((prevVisible) =>
        Math.min(prevVisible + 8, allFindItems.length)
      );
      setLoading(false);
    }, 500); // Невелика затримка для імітації завантаження
  };

  return (
    <Container className={styles.container}>
      <Row className="d-flex justify-content-center">
        <h2 className={`${styles.title} text-center`}>Current Finds</h2>
      </Row>
      <CategoryFilter />

      <Row className={styles.findsGrid}>
        {currentItems.map((item) => (
          <Col key={item.id} xs={6} md={4} lg={3} className={styles.cardCol}>
            <FindCard
              image={item.image}
              date={item.date}
              cityName={item.cityName}
              categoryName={item.categoryName}
            />
          </Col>
        ))}
      </Row>

      {hasMoreItems && (
        <Row className="justify-content-center mt-4 mb-5">
          <Button
            variant="outline-primary"
            className={`${styles.showMoreButton}`}
            onClick={loadMoreItems}
            disabled={loading}
          >
            {loading ? "Loading..." : "Show more"}
          </Button>
        </Row>
      )}
    </Container>
  );
}

export default CurrentFindsSection;

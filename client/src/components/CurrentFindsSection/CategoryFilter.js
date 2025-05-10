import React, { useState, useRef, useEffect } from "react";
import { Image } from "react-bootstrap";
import ButtonFilter from "../ButtonFilter/ButtonFilter";
import arrow from "../../assets/arrowFilter.png";
import styles from "./CurrentFindsSection.module.css";

export const CategoryFilter = () => {
  const categories = [
    "All categories",
    "Documents",
    "Electronics",
    "Clothing and accessories",
    "Pets",
    "Keys",
    "Money and bank cards",
    "Jewelry",
    "Bags",
    "Phones",
    "Toys",
    "Books",
    "Other",
  ];

  const [active, setActive] = useState("All categories");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  // Перевірка чи можна скролити вліво
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        setShowLeftArrow(scrollContainerRef.current.scrollLeft > 0);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Перевірка при першому рендері
      checkScroll();

      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <div className={styles.categoryFilterWrapper}>
      <div className={styles.categoryFilterContainer}>
        {showLeftArrow && (
          <button
            className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
            onClick={scrollLeft}
          >
            <Image src={arrow} alt="Scroll left" className={styles.arrowLeft} />
          </button>
        )}
        <div ref={scrollContainerRef} className={styles.categoryFilterInner}>
          {categories.map((category) => (
            <ButtonFilter
              key={category}
              isActive={active === category}
              onClick={() => setActive(category)}
            >
              {category}
            </ButtonFilter>
          ))}
        </div>
        <button
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          onClick={scrollRight}
        >
          <Image src={arrow} alt="Scroll right" />
        </button>
      </div>
    </div>
  );
};

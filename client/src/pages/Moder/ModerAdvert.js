import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "./ModerAdvert.module.css";
import LossCard from "../../components/LossCard/LossCard";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import ShowMoreButton from "../../components/ShowMoreButton/ShowMoreButton";

function ModerAdvert() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState(null);

  const fetchAdvertisements = async (pageNum = 1, authToken) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 8,
      };

      const response = await axios.get(
        process.env.REACT_APP_SERVER_URL + "/api/advertisement/moderation",
        { params, headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (pageNum === 1) {
        setAdvertisements(response.data.items || []);
      } else {
        setAdvertisements((prev) => [...prev, ...(response.data.items || [])]);
      }

      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Помилка при отриманні оголошень:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    fetchAdvertisements(1, storedToken);
  }, []);

  const handleShowMore = () => {
    if (!loading && hasMore) {
      fetchAdvertisements(page + 1);
    }
  };

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Модерація оголошень</h2>
      <Row className={styles.advertisementsGrid}>
        {loading && page === 1 ? (
          <Col xs={12} className="text-center"></Col>
        ) : advertisements && advertisements.length > 0 ? (
          advertisements.map((ad) => (
            <Col
              key={ad.advertisement_id}
              xs={12}
              sm={12}
              md={12}
              lg={12}
              className={styles.cardCol}
            >
              <LossCard
                advertisement_id={ad.advertisement_id}
                image={
                  ad.Images?.[0]?.image_url
                    ? `${ad.Images[0].image_url}`
                    : undefined
                }
                date={new Date(ad.incident_date).toLocaleDateString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                title={ad.title}
                cityName={ad.location_description}
                categoryName={ad.categorie_name || "Інше"}
                description={ad.description}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <p className="text-center">Немає оголошень для модерації</p>
          </Col>
        )}
      </Row>
      {hasMore && <ShowMoreButton loading={loading} onClick={handleShowMore} />}
    </Container>
  );
}

export default ModerAdvert;

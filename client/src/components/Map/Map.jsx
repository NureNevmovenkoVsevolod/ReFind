import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Map.module.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map = ({ onLocationSelect, onAddressFound }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMapClick = useCallback(
    async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(
          mapRef.current
        );
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name;

        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
        if (onAddressFound) {
          onAddressFound(address);
        }
      } catch (error) {
        console.error("Error getting address:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [onLocationSelect, onAddressFound]
  );

  useEffect(() => {
    const map = L.map("map").setView([50.4501, 30.5234], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", handleMapClick);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        if (markerRef.current) {
          markerRef.current.remove();
        }
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Пустий масив залежностей

  return (
    <div className={styles.mapContainer}>
      <div id="map" className={styles.map} />
      {isLoading && <div className={styles.loading}>Loading address...</div>}
    </div>
  );
};

export default Map;

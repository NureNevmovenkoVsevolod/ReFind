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

const Map = ({ onLocationSelect, onAddressFound, initialCoordinates, readOnly = false }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const map = L.map(mapContainerId.current).setView(
      initialCoordinates && typeof initialCoordinates.lat === 'number' && typeof initialCoordinates.lng === 'number'
        ? [initialCoordinates.lat, initialCoordinates.lng]
        : [50.4501, 30.5234],
      13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    if (!readOnly) {
      map.on("click", handleMapClick);
    }
    mapRef.current = map;
    if (initialCoordinates && typeof initialCoordinates.lat === 'number' && typeof initialCoordinates.lng === 'number') {
      markerRef.current = L.marker([initialCoordinates.lat, initialCoordinates.lng], { icon: defaultIcon }).addTo(map);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (initialCoordinates && typeof initialCoordinates.lat === 'number' && typeof initialCoordinates.lng === 'number') {
      if (!markerRef.current) {
        markerRef.current = L.marker([initialCoordinates.lat, initialCoordinates.lng], { icon: defaultIcon }).addTo(mapRef.current);
        mapRef.current.setView([initialCoordinates.lat, initialCoordinates.lng], mapRef.current.getZoom());
      } else {
        markerRef.current.setLatLng([initialCoordinates.lat, initialCoordinates.lng]);
        mapRef.current.setView([initialCoordinates.lat, initialCoordinates.lng], mapRef.current.getZoom());
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [initialCoordinates]);

  const addMarkerAt = async (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(mapRef.current);
    }
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
    if (!readOnly) {
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
    }
  };

  const handleMapClick = useCallback(
    async (e) => {
      const { lat, lng } = e.latlng;
      await addMarkerAt(lat, lng);
    },
    [onLocationSelect, onAddressFound]
  );

  return (
    <div className={styles.mapContainer}>
      <div id={mapContainerId.current} className={styles.map} />
      {!readOnly && isLoading && <div className={styles.loading}>Loading address...</div>}
    </div>
  );
};

export default Map;

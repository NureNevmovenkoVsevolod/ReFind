import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiUrl = 'https://refind-wm5m.onrender.com/api';

const leafletHtml = (adsJson) => `
<!DOCTYPE html>
<html>
<head>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map" style="width: 100vw; height: 100vh;"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([50.4501, 30.5234], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    var ads = ${adsJson};
    ads.forEach(function(ad) {
      if (ad.latitude && ad.longitude) {
        var marker = L.marker([ad.latitude, ad.longitude]).addTo(map);
        var typeText = ad.type === 'lost' ? 'Загублено' : 'Знайдено';
        var imgUrl = '';
        if (ad.Images && ad.Images.length > 0 && ad.Images[0].image_url) {
          imgUrl = ad.Images[0].image_url;
        } else {
          imgUrl = 'https://via.placeholder.com/100x100.png?text=No+Image';
        }
        var rewardBlock = '';
        if (ad.reward && Number(ad.reward) > 0) {
          rewardBlock = '<div style="color:#f39c12;font-size:14px;margin-top:4px;">Винагорода: ' + ad.reward + ' грн</div>';
        }
        var popup =
          '<div style="text-align:center;">' +
            '<img src="' + imgUrl + '" alt="Фото" style="width:100px;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />' +
            '<div style="font-weight:bold;font-size:16px;margin-bottom:4px;">' + (ad.title || '') + '</div>' +
            '<div style="color:#5a67d8;font-size:14px;">' + typeText + '</div>' +
            rewardBlock +
            '<button id="details-btn-' + ad.advertisement_id + '" style="margin-top:8px;padding:6px 16px;background:#5a67d8;color:#fff;border:none;border-radius:5px;cursor:pointer;">Детальніше</button>' +
          '</div>';
        marker.bindPopup(popup);
        marker.on('popupopen', function(e) {
          var btn = document.getElementById('details-btn-' + ad.advertisement_id);
          if (btn) {
            btn.onclick = function(ev) {
              ev.stopPropagation();
              if (window.ReactNativeWebView && ad.advertisement_id) {
                window.ReactNativeWebView.postMessage(String(ad.advertisement_id));
              }
            };
          }
        });
      }
    });
  </script>
</body>
</html>
`;

const MapScreen = ({ navigation }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${apiUrl}/advertisement/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // Якщо бекенд повертає { items: [...] }
        const items = Array.isArray(data) ? data : data.items || [];
        const parsedAds = items.map(ad => {
          let latitude = null, longitude = null;
          if (ad.location_coordinates) {
            try {
              // location_coordinates може бути подвійно закодований JSON
              let coords = ad.location_coordinates;
              if (typeof coords === 'string') {
                coords = JSON.parse(coords);
                if (typeof coords === 'string') coords = JSON.parse(coords);
              }
              latitude = coords.lat;
              longitude = coords.lng;
            } catch (e) {}
          }
          return { ...ad, latitude, longitude };
        });
        setAds(parsedAds);
        console.log('parsedAds:', parsedAds);
      } catch (e) {
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleWebViewMessage = (event) => {
    const adId = event.nativeEvent.data;
    const ad = ads.find(a => String(a.advertisement_id) === String(adId));
    if (ad) {
      navigation.navigate('AdvertisementDetail', { item: ad });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#5a67d8" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: leafletHtml(JSON.stringify(ads)) }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleWebViewMessage}
      />
      <BottomNavBar activeScreen="Map" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapScreen; 
import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps'
import { WebView } from 'react-native-webview'
import Svg, { Path, Circle } from 'react-native-svg'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { Colors } from '../../src/constants/colors'
import { useAuthStore } from '../../src/store/auth.store'
import { GrifoMarker } from '../../src/components/mapa/GrifoMarker'
import { GrifoBottomSheet } from '../../src/components/mapa/GrifoBottomSheet'
import { Config } from '../../src/constants/config'
import { FirestoreService } from '../../src/services/firestore.service'
import { PlacesService } from '../../src/services/places.service'
import type { Grifo } from '../../src/types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

function IcoSearch({ color = '#9CA3AF', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Circle cx='11' cy='11' r='8' stroke={color} strokeWidth={1.8} />
      <Path d='M21 21l-4.35-4.35' stroke={color} strokeWidth={1.8} strokeLinecap='round' />
    </Svg>
  )
}

function IcoMapPin({ color = '#1B2B6B', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z' stroke={color} strokeWidth={1.8} />
      <Circle cx='12' cy='10' r='3' stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}

/** Genera el HTML completo de Leaflet con los marcadores de los grifos */
function buildLeafletHTML(
  center: { latitude: number; longitude: number },
  grifos: Grifo[],
  userLocation: { latitude: number; longitude: number } | null
): string {
  const markersJS = grifos
    .slice(0, 30)
    .map(g => {
      const name = g.nombre.replace(/'/g, "\\'")
      const dir = g.direccion.replace(/'/g, "\\'")
      const precio = g.precios?.[0]
        ? `S/ ${g.precios[0].precio.toFixed(2)} (${g.precios[0].tipo})`
        : 'Sin precio'
      return `
        L.marker([${g.latitude}, ${g.longitude}], { icon: repsolIcon })
          .addTo(map)
          .bindPopup('<b>${name}</b><br/>${dir}<br/>${precio}');`
    })
    .join('\n')

  const userMarkerJS = userLocation
    ? `L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
        radius: 8, fillColor: '#1B2B6B', color: 'white',
        weight: 2, opacity: 1, fillOpacity: 0.9
      }).addTo(map).bindPopup('Tu ubicación');`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView(
      [${center.latitude}, ${center.longitude}], 13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    var repsolIcon = L.divIcon({
      html: '<div style="background:#F4821E;width:28px;height:28px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.4);">R</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      className: ''
    });

    ${markersJS}
    ${userMarkerJS}
  </script>
</body>
</html>`
}

export default function MapaScreen() {
  const user = useAuthStore(state => state.user)
  const mapRef = useRef<MapView>(null)
  const [grifos, setGrifos] = useState<Grifo[]>([])
  const [selectedGrifo, setSelectedGrifo] = useState<Grifo | null>(null)
  const [searchText, setSearchText] = useState('')
  const [locationReady, setLocationReady] = useState(false)
  const [recentering, setRecentering] = useState(false)
  const [loadingGrifos, setLoadingGrifos] = useState(true)
  const [mapCenter, setMapCenter] = useState({ latitude: -12.0464, longitude: -77.0428 })
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [useLeaflet, setUseLeaflet] = useState(false)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        setLocationReady(true)
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
          setMapCenter(coords)
          setUserLocation(coords)
        } catch {}
      }
      try {
        const ubicacion = userLocation ?? { latitude: -12.0464, longitude: -77.0428 }
        const data = await PlacesService.buscarGrifosCercanos(ubicacion, 15000)
        setGrifos(data)
      } catch (err) {
        console.error('Error cargando grifos:', err)
        try {
          const data = await FirestoreService.getGrifos()
          setGrifos(data)
        } catch {}
      } finally {
        setLoadingGrifos(false)
      }
    })()
  }, [])

  // Si en 5 segundos el MapView no llamó onMapReady, cambiar a Leaflet
  useEffect(() => {
    const timer = setTimeout(() => setUseLeaflet(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  function handleMarkerPress(grifo: Grifo) {
    setSelectedGrifo(grifo)
  }

  function handleCloseSheet() {
    setSelectedGrifo(null)
  }

  async function handleToggleFavorito(id: string) {
    const grifo = grifos.find(g => g.id === id)
    if (!grifo) return
    setGrifos(prev => prev.map(g => (g.id === id ? { ...g, esFavorito: !g.esFavorito } : g)))
    if (selectedGrifo?.id === id) {
      setSelectedGrifo(prev => prev ? { ...prev, esFavorito: !prev.esFavorito } : null)
    }
    if (user?.uid) {
      try {
        await FirestoreService.toggleFavorito(user.uid, id, {
          grifoId: id, nombre: grifo.nombre, direccion: grifo.direccion,
          latitude: grifo.latitude, longitude: grifo.longitude,
        })
      } catch (err) {
        console.error('Error guardando favorito:', err)
      }
    }
  }

  async function handleRecenter() {
    setRecentering(true)
    try {
      if (locationReady) {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude, longitude: loc.coords.longitude,
          latitudeDelta: 0.05, longitudeDelta: 0.05,
        }, 800)
      } else {
        mapRef.current?.animateToRegion(Config.LIMA_CENTER as Region, 800)
      }
    } catch {
      mapRef.current?.animateToRegion(Config.LIMA_CENTER as Region, 800)
    } finally {
      setRecentering(false)
    }
  }

  const filteredGrifos = searchText
    ? grifos.filter(g =>
        g.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        g.direccion.toLowerCase().includes(searchText.toLowerCase())
      )
    : grifos

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {useLeaflet ? (
          // Leaflet / OpenStreetMap — funciona en emulador y dispositivo
          <WebView
            source={{ html: buildLeafletHTML(mapCenter, filteredGrifos, userLocation) }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            onError={e => console.warn('[Leaflet] error:', e.nativeEvent)}
          />
        ) : (
          // Google Maps nativo — funciona en dispositivo físico
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            initialRegion={Config.LIMA_CENTER as Region}
            showsUserLocation={locationReady}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            onMapReady={() => setUseLeaflet(false)}
          >
            {filteredGrifos.map(grifo => (
              <GrifoMarker
                key={grifo.id}
                grifo={grifo}
                onPress={handleMarkerPress}
                selected={selectedGrifo?.id === grifo.id}
              />
            ))}
          </MapView>
        )}
      </View>

      {/* Search bar */}
      <SafeAreaView style={styles.searchOverlay} edges={['top']}>
        <View style={styles.searchBar}>
          <IcoSearch size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grifo Repsol..."
            placeholderTextColor={Colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>

      {/* Loading */}
      {loadingGrifos && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.navy} />
          <Text style={styles.loadingText}>Cargando grifos...</Text>
        </View>
      )}

      {/* Contador */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{filteredGrifos.length} grifos</Text>
      </View>

      {/* Botón recentrar — solo para Google Maps nativo */}
      {!useLeaflet && (
        <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter} activeOpacity={0.85}>
          {recentering
            ? <ActivityIndicator size="small" color={Colors.navy} />
            : <IcoMapPin size={22} color={Colors.navy} />
          }
        </TouchableOpacity>
      )}

      <GrifoBottomSheet
        grifo={selectedGrifo}
        onClose={handleCloseSheet}
        onToggleFavorito={handleToggleFavorito}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  searchOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14,
    paddingHorizontal: 14, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  clearBtn: { fontSize: 14, color: Colors.textMuted, padding: 4 },
  countBadge: {
    position: 'absolute', bottom: 200, left: 16,
    backgroundColor: Colors.navy, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  countText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  recenterBtn: {
    position: 'absolute', bottom: 200, right: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  loadingOverlay: {
    position: 'absolute', top: 100, alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  loadingText: { fontSize: 14, color: Colors.navy, fontWeight: '600' },
})

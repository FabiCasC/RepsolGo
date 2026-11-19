import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native'
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps'
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

function IcoGasPump({ color = Colors.orange, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path d='M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9' stroke={color} strokeWidth={1.8} strokeLinecap='round' />
      <Path d='M15 13h2a2 2 0 012 2v3a2 2 0 002 2' stroke={color} strokeWidth={1.8} strokeLinecap='round' />
      <Path d='M5 6h6M3 22h10' stroke={color} strokeWidth={1.8} strokeLinecap='round' />
    </Svg>
  )
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBspcTEh828O90o862FewdtQeCek9MIXOk'

function buildStaticMapUrl(
  center: { latitude: number; longitude: number },
  grifos: Grifo[],
  width: number,
  height: number
): string {
  if (!center.latitude || !center.longitude) return ''
  const base = 'https://maps.googleapis.com/maps/api/staticmap'
  const centerStr = `${center.latitude},${center.longitude}`
  const size = `${Math.round(width)}x${Math.round(height)}`
  const markers = grifos
    .slice(0, 20)
    .map(g => `markers=color:red%7Clabel:R%7C${g.latitude},${g.longitude}`)
    .join('&')
  return `${base}?center=${centerStr}&zoom=13&size=${size}&scale=2&maptype=roadmap&${markers}&key=${GOOGLE_MAPS_API_KEY}`
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
  const [useStaticMap, setUseStaticMap] = useState(false)
  const [mapLayout, setMapLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 })

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        setLocationReady(true)
      }
      try {
        let ubicacion = { latitude: -12.0464, longitude: -77.0428 }
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          ubicacion = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
          setMapCenter(ubicacion)
        }
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

  // Si en 5 segundos el MapView no llamó onMapReady (emulador), cambia a Static Maps
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseStaticMap(true)
    }, 5000)
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
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
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
    ? grifos.filter(
        g =>
          g.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
          g.direccion.toLowerCase().includes(searchText.toLowerCase())
      )
    : grifos

  const staticMapUri = useStaticMap
    ? buildStaticMapUrl(mapCenter, filteredGrifos, mapLayout.width, mapLayout.height)
    : null

  return (
    <View style={styles.container}>
      <View
        style={styles.mapContainer}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout
          setMapLayout({ width, height })
        }}
      >
        {useStaticMap ? (
          // Static Maps API + lista de grifos scrolleable debajo
          <View style={{ flex: 1 }}>
            {staticMapUri ? (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.staticMapWrap}
                onPress={() => setSelectedGrifo(null)}
              >
                <Image
                  source={{ uri: staticMapUri }}
                  style={styles.staticMapImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.staticMapWrap, styles.mapPlaceholder]}>
                <IcoMapPin color={Colors.navy} size={40} />
                <Text style={styles.mapPlaceholderText}>Lima, Perú</Text>
              </View>
            )}

            {/* Lista de grifos bajo el mapa estático */}
            <ScrollView style={styles.grifoList} contentContainerStyle={{ paddingBottom: 16 }}>
              {filteredGrifos.length === 0 && !loadingGrifos ? (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No se encontraron grifos Repsol cerca.</Text>
                </View>
              ) : (
                filteredGrifos.map(grifo => (
                  <TouchableOpacity
                    key={grifo.id}
                    style={styles.grifoRow}
                    onPress={() => setSelectedGrifo(grifo)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.grifoIconWrap}>
                      <IcoGasPump color={grifo.abierto24h ? Colors.orange : Colors.textMuted} size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.grifoNombre} numberOfLines={1}>{grifo.nombre}</Text>
                      <Text style={styles.grifoDireccion} numberOfLines={1}>{grifo.direccion}</Text>
                    </View>
                    {grifo.precios?.[0] ? (
                      <Text style={styles.grifoPrecio}>
                        S/ {grifo.precios[0].precio > 0 ? grifo.precios[0].precio.toFixed(2) : '--'}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
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
            onMapReady={() => setUseStaticMap(false)}
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

      {/* Loading grifos */}
      {loadingGrifos && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.navy} />
          <Text style={styles.loadingText}>Cargando grifos...</Text>
        </View>
      )}

      {/* Contador — solo en modo Google Maps */}
      {!useStaticMap && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredGrifos.length} grifos</Text>
        </View>
      )}

      {/* Botón recentrar — solo en Google Maps nativo */}
      {!useStaticMap && (
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

  staticMapWrap: { height: SCREEN_HEIGHT * 0.38, width: '100%' },
  staticMapImg: { flex: 1, width: '100%', height: '100%' },
  mapPlaceholder: {
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  mapPlaceholderText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },

  grifoList: { flex: 1, backgroundColor: Colors.surface },
  emptyList: { padding: 24, alignItems: 'center' },
  emptyListText: { color: Colors.textMuted, fontSize: 14 },
  grifoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12,
  },
  grifoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center',
  },
  grifoNombre: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  grifoDireccion: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  grifoPrecio: { fontSize: 13, fontWeight: '700', color: Colors.navy },

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

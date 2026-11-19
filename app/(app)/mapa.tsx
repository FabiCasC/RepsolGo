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
import MapView, { Region, UrlTile } from 'react-native-maps'
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

export default function MapaScreen() {
  const user = useAuthStore(state => state.user)
  const mapRef = useRef<MapView>(null)
  const [grifos, setGrifos] = useState<Grifo[]>([])
  const [selectedGrifo, setSelectedGrifo] = useState<Grifo | null>(null)
  const [searchText, setSearchText] = useState('')
  const [locationReady, setLocationReady] = useState(false)
  const [recentering, setRecentering] = useState(false)
  const [loadingGrifos, setLoadingGrifos] = useState(true)

  useEffect(() => {
    (async () => {
      // Pedir permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        setLocationReady(true)
      }
      // Cargar grifos reales desde Overpass API (con cache en Firestore)
      try {
        let ubicacion = { latitude: -12.0464, longitude: -77.0428 }
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          ubicacion = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
        }
        const data = await PlacesService.buscarGrifosCercanos(ubicacion, 15000)
        setGrifos(data)
      } catch (err) {
        console.error('Error cargando grifos:', err)
        // Fallback a Firestore si Overpass falla
        try {
          const data = await FirestoreService.getGrifos()
          setGrifos(data)
        } catch {}
      } finally {
        setLoadingGrifos(false)
      }
    })()
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

    // Toggle local inmediato
    setGrifos(prev =>
      prev.map(g => (g.id === id ? { ...g, esFavorito: !g.esFavorito } : g))
    )
    if (selectedGrifo?.id === id) {
      setSelectedGrifo(prev => prev ? { ...prev, esFavorito: !prev.esFavorito } : null)
    }

    // Persistir en Firestore si hay usuario
    if (user?.uid) {
      try {
        await FirestoreService.toggleFavorito(user.uid, id, {
          grifoId: id,
          nombre: grifo.nombre,
          direccion: grifo.direccion,
          latitude: grifo.latitude,
          longitude: grifo.longitude,
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

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={Config.LIMA_CENTER as Region}
          showsUserLocation={locationReady}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          // Sin provider: acepta UrlTile en ambas plataformas (iOS y Android)
        >
          {/* Tiles de OpenStreetMap — gratis, sin API key */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            tileSize={256}
          />

          {filteredGrifos.map(grifo => (
            <GrifoMarker
              key={grifo.id}
              grifo={grifo}
              onPress={handleMarkerPress}
              selected={selectedGrifo?.id === grifo.id}
            />
          ))}
        </MapView>
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

      {/* Contador */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{filteredGrifos.length} grifos</Text>
      </View>

      {/* Botón recentrar */}
      <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter} activeOpacity={0.85}>
        {recentering
          ? <ActivityIndicator size="small" color={Colors.navy} />
          : <IcoMapPin size={22} color={Colors.navy} />
        }
      </TouchableOpacity>

      <GrifoBottomSheet
        grifo={selectedGrifo}
        onClose={handleCloseSheet}
        onToggleFavorito={handleToggleFavorito}
      />
    </View>
  )
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: {
    fontSize: 14,
    color: Colors.textMuted,
    padding: 4,
  },
  countBadge: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    backgroundColor: Colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 200,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.navy,
    fontWeight: '600',
  },
})

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import { Colors } from '../../src/constants/colors'
import { Button } from '../../src/components/ui/Button'

interface GrifoRuta {
  id: string
  nombre: string
  direccion: string
  distancia: number
  precio90: number
  tiempoEspera: string
  latitude: number
  longitude: number
}

const GRIFOS_LIMA: GrifoRuta[] = [
  { id: '1', nombre: 'Repsol Javier Prado Este', direccion: 'Av. Javier Prado Este 4200, San Borja', distancia: 0, precio90: 16.49, tiempoEspera: '5 min', latitude: -12.0864, longitude: -76.9969 },
  { id: '2', nombre: 'Repsol La Marina', direccion: 'Av. La Marina 2100, San Miguel', distancia: 0, precio90: 16.52, tiempoEspera: '8 min', latitude: -12.0774, longitude: -77.0921 },
  { id: '3', nombre: 'Repsol Benavides', direccion: 'Av. Benavides 1800, Miraflores', distancia: 0, precio90: 16.45, tiempoEspera: '3 min', latitude: -12.1328, longitude: -77.0054 },
  { id: '4', nombre: 'Repsol Panamericana Norte', direccion: 'Panamericana Norte Km 12, Los Olivos', distancia: 0, precio90: 16.39, tiempoEspera: '12 min', latitude: -11.9823, longitude: -77.0789 },
  { id: '5', nombre: 'Repsol Atocongo', direccion: 'Av. Atocongo 2451, San Juan de Miraflores', distancia: 0, precio90: 16.42, tiempoEspera: '6 min', latitude: -12.1700, longitude: -76.9800 },
]

function getDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function ViajeScreen() {
  const [destino, setDestino] = useState('')
  const [grifos, setGrifos] = useState<GrifoRuta[]>([])
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)

  async function handleBuscar() {
    if (!destino.trim()) {
      Alert.alert('Destino requerido', 'Ingresa tu destino para buscar grifos en ruta.')
      return
    }
    setBuscando(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      let userLat = -12.0464
      let userLng = -77.0428

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        userLat = loc.coords.latitude
        userLng = loc.coords.longitude
      }

      const grifosConDistancia = GRIFOS_LIMA.map(g => ({
        ...g,
        distancia: parseFloat(getDistanciaKm(userLat, userLng, g.latitude, g.longitude).toFixed(1)),
      })).sort((a, b) => a.distancia - b.distancia)

      setGrifos(grifosConDistancia)
      setBuscado(true)
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Planifica tu ruta</Text>
        <Text style={styles.headerTitle}>Modo Viaje 🚗</Text>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.searchSection}>
          <Text style={styles.inputLabel}>¿A dónde vas?</Text>
          <TextInput
            style={styles.destinoInput}
            value={destino}
            onChangeText={setDestino}
            placeholder="Ej: Aeropuerto Jorge Chávez, Lima"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleBuscar}
          />
          <Button
            label={buscando ? 'Buscando...' : '🗺️  Buscar grifos en ruta'}
            onPress={handleBuscar}
            fullWidth
            style={styles.searchBtn}
          />
        </View>

        {buscando && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.orange} />
            <Text style={styles.loadingText}>Calculando ruta...</Text>
          </View>
        )}

        {buscado && !buscando && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              Grifos Repsol cerca de tu ruta
            </Text>
            <Text style={styles.resultSub}>Ordenados por distancia desde tu ubicación</Text>
            {grifos.map((g, idx) => (
              <View key={g.id} style={[styles.grifoCard, idx === 0 && styles.grifoCardTop]}>
                {idx === 0 && (
                  <View style={styles.recomBadge}>
                    <Text style={styles.recomText}>⭐ Más cercano</Text>
                  </View>
                )}
                <View style={styles.grifoHeader}>
                  <View style={styles.grifoIconBox}>
                    <Text style={styles.grifoIconText}>⛽</Text>
                  </View>
                  <View style={styles.grifoInfo}>
                    <Text style={styles.grifoNombre}>{g.nombre}</Text>
                    <Text style={styles.grifoDireccion} numberOfLines={1}>{g.direccion}</Text>
                  </View>
                </View>
                <View style={styles.grifoStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{g.distancia} km</Text>
                    <Text style={styles.statLabel}>Distancia</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>S/ {g.precio90.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>90 oct/gal</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{g.tiempoEspera}</Text>
                    <Text style={styles.statLabel}>Espera</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {!buscado && !buscando && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>Encuentra grifos en tu camino</Text>
            <Text style={styles.emptyDesc}>
              Ingresa tu destino y te mostraremos los grifos Repsol más cercanos a tu ruta, con precios y tiempos de espera.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  scroll: { flex: 1 },
  searchSection: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  destinoInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: Colors.textPrimary, backgroundColor: Colors.white, marginBottom: 12,
  },
  searchBtn: {},
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 15, color: Colors.textSecondary, marginTop: 16 },
  resultSection: { paddingHorizontal: 16, paddingBottom: 32 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  resultSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  grifoCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  grifoCardTop: { borderColor: Colors.orange, borderWidth: 2 },
  recomBadge: {
    backgroundColor: '#FFF3E0', borderRadius: 20, paddingHorizontal: 12,
    paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10,
  },
  recomText: { fontSize: 12, fontWeight: '600', color: Colors.orange },
  grifoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  grifoIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  grifoIconText: { fontSize: 22 },
  grifoInfo: { flex: 1 },
  grifoNombre: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  grifoDireccion: { fontSize: 12, color: Colors.textSecondary },
  grifoStats: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 10, padding: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.navy },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  emptyState: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 40 },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})

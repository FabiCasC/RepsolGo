import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { Colors } from '@/src/constants/colors'
import { PlacesService } from '@/src/services/places.service'
import type { GrifoRuta } from '@/src/services/places.service'
import * as Location from 'expo-location'

// --- Iconos SVG (sin emojis) ---

function IcoRuta({ color = Colors.orange, size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5" cy="6" r="2" stroke={color} strokeWidth={1.8} />
      <Circle cx="19" cy="18" r="2" stroke={color} strokeWidth={1.8} />
      <Path d="M5 8v5a3 3 0 003 3h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 14l2 2-2 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IcoGasPump({ color = Colors.orange, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="5" y1="6" x2="11" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="22" x2="13" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}

function IcoClock({ color = Colors.textSecondary, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}

function IcoSearch({ color = Colors.textMuted, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={1.8} />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}

function IcoMapPin({ color = Colors.navy, size = 48 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={1.5} />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={1.5} />
    </Svg>
  )
}

function IcoNavigation({ color = Colors.orange, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11l19-9-9 19-2-8-8-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// --- Pantalla ---

export default function ViajeScreen() {
  const [destino, setDestino] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [grifos, setGrifos] = useState<GrifoRuta[]>([])
  const [buscado, setBuscado] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleBuscar() {
    if (!destino.trim()) return
    setBuscando(true)
    setGrifos([])
    setBuscado(false)
    setErrorMsg('')

    try {
      // Obtener ubicación actual del usuario
      let origen = { latitude: -12.0464, longitude: -77.0428 } // Lima por defecto

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        origen = { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
      }

      const resultados = await PlacesService.buscarGrifosEnRuta(origen, destino.trim())
      setGrifos(resultados)
      setBuscado(true)

      if (resultados.length === 0) {
        setErrorMsg(`No encontramos grifos Repsol en ruta a "${destino}". Intenta con una ciudad más grande.`)
      }
    } catch (err) {
      console.error('[ViajeScreen] error:', err)
      setErrorMsg('No se pudo buscar la ruta. Verifica tu conexión e intenta de nuevo.')
      setBuscado(true)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <IcoRuta size={28} />
          <Text style={styles.title}>Modo Viaje</Text>
        </View>
        <Text style={styles.subtitle}>
          Ingresa tu destino y te mostramos los grifos Repsol en ruta con precios y disponibilidad.
        </Text>

        {/* Buscador */}
        <View style={styles.searchBox}>
          <View style={styles.inputWrap}>
            <IcoSearch size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Destino (ej: Ica, Nasca, Arequipa)"
              placeholderTextColor={Colors.textMuted}
              value={destino}
              onChangeText={setDestino}
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[styles.btnBuscar, (!destino.trim() || buscando) && styles.btnDisabled]}
            onPress={handleBuscar}
            disabled={!destino.trim() || buscando}
            activeOpacity={0.8}
          >
            {buscando
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.btnText}>Buscar ruta</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {buscado && !errorMsg && grifos.length > 0 && (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {grifos.length} grifo{grifos.length !== 1 ? 's' : ''} Repsol en ruta a {destino}
              </Text>
            </View>

            {grifos.map(grifo => (
              <View key={grifo.id} style={[styles.grifoCard, !grifo.abierto24h && styles.grifoCardOff]}>
                <View style={styles.grifoTop}>
                  <View style={styles.grifoIconWrap}>
                    <IcoGasPump
                      color={grifo.abierto24h ? Colors.orange : Colors.textMuted}
                      size={20}
                    />
                  </View>
                  <View style={styles.grifoInfo}>
                    <Text style={[styles.grifoNombre, !grifo.abierto24h && styles.textOff]}>
                      {grifo.nombre}
                    </Text>
                    <Text style={styles.grifoDireccion} numberOfLines={1}>
                      {grifo.direccion}
                    </Text>
                    <View style={styles.grifoMeta}>
                      {grifo.distanciaTexto ? (
                        <>
                          <IcoNavigation size={12} color={Colors.orange} />
                          <Text style={styles.grifoDistancia}> {grifo.distanciaTexto}</Text>
                          <Text style={styles.sep}>·</Text>
                        </>
                      ) : null}
                      <IcoClock size={13} />
                      <Text style={styles.grifoTiempo}> {grifo.duracionTexto || grifo.tiempoEspera}</Text>
                    </View>
                  </View>
                  {!grifo.abierto24h && (
                    <View style={styles.cerradoBadge}>
                      <Text style={styles.cerradoText}>Cerrado</Text>
                    </View>
                  )}
                </View>

                {(grifo.precios?.length ?? 0) > 0 && (
                  <View style={styles.grifoBottom}>
                    {grifo.precios?.slice(0, 2).map(p => (
                      <View key={p.tipo} style={styles.precioChip}>
                        <Text style={styles.precioLabel}>{p.tipo}</Text>
                        {p.precio > 0
                          ? <Text style={styles.precioValor}>S/ {p.precio.toFixed(2)}</Text>
                          : <Text style={styles.precioSinDato}>Sin dato</Text>
                        }
                      </View>
                    ))}
                    <View style={styles.esperaChip}>
                      <IcoClock color={Colors.green} size={12} />
                      <Text style={styles.esperaText}> {grifo.tiempoEspera}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Error / sin resultados */}
        {buscado && (errorMsg || grifos.length === 0) && (
          <View style={styles.emptyState}>
            <IcoMapPin color={Colors.textMuted} size={40} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              {errorMsg || `No encontramos grifos Repsol en ruta a "${destino}".`}
            </Text>
          </View>
        )}

        {/* Estado inicial */}
        {!buscado && !buscando && (
          <View style={styles.emptyState}>
            <IcoRuta color={Colors.textMuted} size={48} />
            <Text style={styles.emptyTitle}>Planifica tu viaje</Text>
            <Text style={styles.emptyText}>
              Ingresa tu destino arriba para ver los grifos Repsol disponibles en la ruta con precios actualizados.
            </Text>
          </View>
        )}

        {/* Cargando */}
        {buscando && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.orange} />
            <Text style={styles.loadingText}>Buscando grifos Repsol en ruta...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 18 },

  searchBox: { gap: 10, marginBottom: 20 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  btnBuscar: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  resultHeader: { marginBottom: 12 },
  resultTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  grifoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  grifoCardOff: { opacity: 0.5 },
  grifoTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  grifoIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  grifoInfo: { flex: 1 },
  grifoNombre: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  grifoDireccion: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  textOff: { color: Colors.textMuted },
  grifoMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  grifoDistancia: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  sep: { color: Colors.textMuted, marginHorizontal: 2 },
  grifoTiempo: { fontSize: 12, color: Colors.textSecondary },
  cerradoBadge: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6,
  },
  cerradoText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },

  grifoBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  precioChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: 'row', gap: 4, alignItems: 'center',
  },
  precioLabel: { fontSize: 11, color: Colors.textSecondary },
  precioValor: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  precioSinDato: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' },
  esperaChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  esperaText: { fontSize: 11, color: Colors.green, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: {
    fontSize: 13, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 18, maxWidth: 280,
  },

  loadingState: { alignItems: 'center', marginTop: 60, gap: 16 },
  loadingText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
})

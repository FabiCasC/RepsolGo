import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Svg, { Path, Circle } from 'react-native-svg'
import { Colors } from '../../../src/constants/colors'
import { useAuthStore } from '../../../src/store/auth.store'
import { FirestoreService } from '../../../src/services/firestore.service'
import { Timestamp } from '@firebase/firestore'

interface Carga {
  id: string
  grifoNombre: string
  fecha: string
  litros: string
  monto: string
  combustible: string
  puntos: number
  timestamp?: Timestamp
}

function predecirProximaCarga(cargas: Carga[]): string | null {
  if (cargas.length < 2) return null
  // Sort by timestamp if available, otherwise by fecha string
  const sorted = [...cargas].sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return b.timestamp.toMillis() - a.timestamp.toMillis()
    }
    return 0
  })
  if (sorted.length < 2) return null
  // Calculate average days between cargas
  const intervals: number[] = []
  for (let i = 0; i < sorted.length - 1 && i < 5; i++) {
    if (sorted[i].timestamp && sorted[i + 1].timestamp) {
      const diffMs = sorted[i].timestamp!.toMillis() - sorted[i + 1].timestamp!.toMillis()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (diffDays > 0) intervals.push(diffDays)
    }
  }
  if (intervals.length === 0) return null
  const avgDays = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (!sorted[0].timestamp) return null
  const nextDate = new Date(sorted[0].timestamp.toMillis() + avgDays * 24 * 60 * 60 * 1000)
  const today = new Date()
  const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Pronto (ya debería haber cargado)'
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  return `En ${diffDays} días (${nextDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })})`
}

function calcularEstadisticas(cargas: Carga[]) {
  if (cargas.length === 0) return null
  const totalPuntos = cargas.reduce((s, c) => s + (c.puntos ?? 0), 0)
  const combCount: Record<string, number> = {}
  cargas.forEach(c => { if (c.combustible) combCount[c.combustible] = (combCount[c.combustible] ?? 0) + 1 })
  const favCombustible = Object.entries(combCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  return { totalCargas: cargas.length, totalPuntos, favCombustible }
}

export default function HistorialScreen() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    FirestoreService.getCargas(user.id)
      .then(data => setCargas(data as Carga[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  const stats = calcularEstadisticas(cargas)
  const prediccion = predecirProximaCarga(cargas)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial inteligente</Text>
        <Text style={styles.headerSub}>Análisis de tus cargas de combustible</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Predicción */}
          {prediccion && (
            <View style={styles.predCard}>
              <View style={styles.predIconBox}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={styles.predIcon}><Circle cx="12" cy="12" r="9" stroke="#8B5CF6" strokeWidth={1.8}/><Circle cx="12" cy="12" r="4" stroke="#8B5CF6" strokeWidth={1.8}/><Path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#8B5CF6" strokeWidth={1.8} strokeLinecap="round"/></Svg>
              </View>
              <View style={styles.predContent}>
                <Text style={styles.predLabel}>Próxima carga estimada</Text>
                <Text style={styles.predValue}>{prediccion}</Text>
                <Text style={styles.predHint}>Basado en tu historial de {cargas.length} cargas</Text>
              </View>
            </View>
          )}

          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{stats.totalCargas}</Text>
                <Text style={styles.statLbl}>Cargas totales</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, { color: Colors.orange }]}>{stats.totalPuntos}</Text>
                <Text style={styles.statLbl}>Puntos ganados</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum} numberOfLines={1}>{stats.favCombustible}</Text>
                <Text style={styles.statLbl}>Combustible fav.</Text>
              </View>
            </View>
          )}

          {/* Lista */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todas tus cargas</Text>
            {cargas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={styles.emptyIcon}><Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/><Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 6h6M3 22h10" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/></Svg>
                <Text style={styles.emptyTitle}>Sin cargas aún</Text>
                <Text style={styles.emptyDesc}>Cuando cargues combustible en Repsol, tu historial aparecerá aquí.</Text>
              </View>
            ) : (
              cargas.map(c => (
                <View key={c.id} style={styles.cargaCard}>
                  <View style={styles.cargaIconBox}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.cargaIcon}><Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/><Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 6h6M3 22h10" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/></Svg>
                  </View>
                  <View style={styles.cargaInfo}>
                    <Text style={styles.cargaGrifo} numberOfLines={1}>{c.grifoNombre || 'Grifo Repsol'}</Text>
                    <Text style={styles.cargaFecha}>{c.fecha || '—'}</Text>
                    <View style={styles.cargaTags}>
                      {c.combustible ? <View style={styles.tag}><Text style={styles.tagText}>{c.combustible}</Text></View> : null}
                      {c.litros && c.litros !== '—' ? <View style={styles.tag}><Text style={styles.tagText}>{c.litros} gal</Text></View> : null}
                    </View>
                  </View>
                  <View style={styles.cargaPuntos}>
                    <Text style={styles.puntosNum}>+{c.puntos}</Text>
                    <Text style={styles.puntosLbl}>pts</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  predCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.navy, margin: 16, borderRadius: 20, padding: 20,
  },
  predIconBox: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  predIcon: { fontSize: 28 },
  predContent: { flex: 1 },
  predLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  predValue: { fontSize: 17, fontWeight: '800', color: Colors.orange, marginBottom: 4 },
  predHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16,
    padding: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.navy, marginBottom: 4 },
  statLbl: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 8,
  },
  emptyContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  cargaCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  cargaIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cargaIcon: { fontSize: 20 },
  cargaInfo: { flex: 1 },
  cargaGrifo: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  cargaFecha: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  cargaTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  cargaPuntos: { alignItems: 'center' },
  puntosNum: { fontSize: 18, fontWeight: '800', color: Colors.orange },
  puntosLbl: { fontSize: 11, color: Colors.textSecondary },
})

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import Svg, { Path, Circle } from 'react-native-svg'
import { Colors } from '../../src/constants/colors'
import { FirestoreService } from '../../src/services/firestore.service'
import { useAuthStore } from '../../src/store/auth.store'
import { Timestamp } from '@firebase/firestore'

interface Turno {
  id: string
  tipo: 'entrada' | 'salida'
  timestamp: Timestamp
}

export default function RegistroTurnoScreen() {
  const user = useAuthStore(s => s.user)
  const [ultimoTurno, setUltimoTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)
  const [registrando, setRegistrando] = useState(false)

  const loadTurno = useCallback(async () => {
    if (!user?.id) return
    try {
      const t = await FirestoreService.getUltimoTurno(user.id)
      setUltimoTurno(t as Turno | null)
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadTurno()
  }, [loadTurno])

  const estaEnTurno = ultimoTurno?.tipo === 'entrada'
  const proximoTipo: 'entrada' | 'salida' = estaEnTurno ? 'salida' : 'entrada'

  async function handleRegistrar() {
    if (!user?.id) return
    setRegistrando(true)
    try {
      let lat: number | undefined
      let lng: number | undefined
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        lat = loc.coords.latitude
        lng = loc.coords.longitude
      }
      await FirestoreService.registrarTurno({
        operarioId: user.id,
        tipo: proximoTipo,
        lat,
        lng,
      })
      Alert.alert(
        proximoTipo === 'entrada' ? 'Turno iniciado' : 'Turno finalizado',
        proximoTipo === 'entrada'
          ? 'Has marcado tu entrada correctamente.'
          : 'Has marcado tu salida. ¡Buen trabajo!',
        [{ text: 'OK', onPress: loadTurno }]
      )
    } catch {
      Alert.alert('Error', 'No se pudo registrar el turno.')
    } finally {
      setRegistrando(false)
    }
  }

  function formatTs(ts: Timestamp) {
    if (!ts?.toDate) return '—'
    const d = ts.toDate()
    return d.toLocaleString('es-PE', {
      weekday: 'long', day: '2-digit', month: 'long',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function getDuration() {
    if (!ultimoTurno?.timestamp?.toDate) return null
    if (ultimoTurno.tipo !== 'entrada') return null
    const ms = Date.now() - ultimoTurno.timestamp.toDate().getTime()
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Turno</Text>
        <Text style={styles.headerSub}>Grifo Repsol Javier Prado</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Status card */}
          <View style={[styles.statusCard, estaEnTurno ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusIcon}></Text>
            <Text style={styles.statusTitle}>{estaEnTurno ? 'Turno en curso' : 'Sin turno activo'}</Text>
            {estaEnTurno && getDuration() && (
              <Text style={styles.statusDuration}>Duración: {getDuration()}</Text>
            )}
          </View>

          {/* Last turno info */}
          {ultimoTurno && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Último registro</Text>
              <View style={styles.infoRow}>
                <View style={[styles.tipoBadge, { backgroundColor: ultimoTurno.tipo === 'entrada' ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.tipoText, { color: ultimoTurno.tipo === 'entrada' ? '#065F46' : Colors.red }]}>
                    {ultimoTurno.tipo === 'entrada' ? '▶ ENTRADA' : '◼ SALIDA'}
                  </Text>
                </View>
              </View>
              <Text style={styles.infoTs}>{formatTs(ultimoTurno.timestamp)}</Text>
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={[styles.mainBtn, proximoTipo === 'entrada' ? styles.btnEntrada : styles.btnSalida]}
            onPress={handleRegistrar}
            activeOpacity={0.85}
            disabled={registrando}
          >
            {registrando ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.mainBtnIcon}>{proximoTipo === 'entrada' ? '▶' : '◼'}</Text>
                <Text style={styles.mainBtnText}>
                  {proximoTipo === 'entrada' ? 'Marcar Entrada' : 'Marcar Salida'}
                </Text>
                <Text style={styles.mainBtnSub}>
                  {proximoTipo === 'entrada' ? 'Iniciar turno de trabajo' : 'Finalizar turno de trabajo'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Tu ubicación se registrará automáticamente si concedes el permiso.
          </Text>
        </View>
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
  content: { flex: 1, padding: 20 },
  statusCard: {
    borderRadius: 20, padding: 24, alignItems: 'center',
    marginBottom: 16, borderWidth: 1.5,
  },
  statusActive: { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' },
  statusInactive: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  statusDot: { width: 14, height: 14, borderRadius: 7, marginRight: 6 },
  statusIcon: { fontSize: 48, marginBottom: 12 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  statusDuration: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 20,
  },
  infoLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  infoRow: { marginBottom: 8 },
  tipoBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tipoText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  infoTs: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500', marginTop: 4 },
  mainBtn: {
    borderRadius: 20, padding: 32, alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnEntrada: { backgroundColor: '#059669', shadowColor: '#059669' },
  btnSalida: { backgroundColor: Colors.red, shadowColor: Colors.red },
  mainBtnIcon: { fontSize: 48, color: Colors.white, marginBottom: 10 },
  mainBtnText: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  mainBtnSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  footerNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
})

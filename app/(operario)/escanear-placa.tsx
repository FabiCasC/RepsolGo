import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { Colors } from '../../src/constants/colors'
import { Button } from '../../src/components/ui/Button'
import { FirestoreService } from '../../src/services/firestore.service'
import { useAuthStore } from '../../src/store/auth.store'

type ScanState = 'camera' | 'processing' | 'manual' | 'found' | 'notfound' | 'confirm'

interface ClienteEncontrado {
  uid: string
  nombre: string
  placa: string
}

export default function EscanearPlacaScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [state, setState] = useState<ScanState>('camera')
  const [placaManual, setPlacaManual] = useState('')
  const [cliente, setCliente] = useState<ClienteEncontrado | null>(null)
  const [puntos, setPuntos] = useState('120')
  const [confirming, setConfirming] = useState(false)
  const user = useAuthStore(s => s.user)

  if (!permission) {
    return <View style={styles.loading} />
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
        <View style={styles.permContent}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={styles.permIcon}><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round"/><Circle cx="12" cy="13" r="4" stroke={Colors.orange} strokeWidth={1.8}/></Svg>
          <Text style={styles.permTitle}>Cámara necesaria</Text>
          <Text style={styles.permDesc}>Para escanear las placas de los vehículos.</Text>
          {permission.canAskAgain ? (
            <Button label="Conceder permiso" onPress={requestPermission} fullWidth style={styles.permBtn} />
          ) : (
            <>
              <Text style={styles.deniedText}>Permiso denegado. Habilítalo en Configuración.</Text>
              <Button label="Abrir Configuración" onPress={() => Linking.openSettings()} fullWidth style={styles.permBtn} />
            </>
          )}
          <TouchableOpacity onPress={() => setState('manual')} style={styles.manualLink}>
            <Text style={styles.manualLinkText}>Ingresar placa manualmente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  async function buscarCliente(placa: string) {
    setState('processing')
    try {
      const result = await FirestoreService.getClienteByPlaca(placa.toUpperCase())
      if (result) {
        setCliente({ uid: result.uid, nombre: result.nombre, placa: placa.toUpperCase() })
        setState('found')
      } else {
        setCliente(null)
        setState('notfound')
      }
    } catch {
      Alert.alert('Error', 'No se pudo buscar la placa.')
      setState('camera')
    }
  }

  function handleCapture() {
    // Simulate OCR scan — in real use, barcode scanning or OCR backend
    const MOCK_PLACA = 'ABC-123'
    buscarCliente(MOCK_PLACA)
  }

  async function handleAcreditar() {
    if (!cliente || !user) return
    const pts = parseInt(puntos, 10)
    if (isNaN(pts) || pts <= 0) {
      Alert.alert('Error', 'Ingresa un número de puntos válido.')
      return
    }
    setConfirming(true)
    try {
      await FirestoreService.acreditarPuntosCliente(cliente.uid, pts, {
        grifoNombre: 'Repsol Javier Prado',
        fecha: new Date().toLocaleDateString('es-PE'),
        litros: '—',
        monto: '—',
        combustible: '95 oct',
        puntos: pts,
      })
      Alert.alert(
        '¡Puntos acreditados!',
        `+${pts} puntos acreditados a ${cliente.nombre}`,
        [{ text: 'OK', onPress: () => { setCliente(null); setPuntos('120'); setState('camera') } }]
      )
    } catch (err) {
      Alert.alert('Error', 'No se pudieron acreditar los puntos.')
    } finally {
      setConfirming(false)
    }
  }

  if (state === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back">
          <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Escanear Placa</Text>
              <Text style={styles.cameraSubtitle}>Encuadra la placa del vehículo</Text>
            </View>
            <View style={styles.guideArea}>
              <View style={styles.guideFrame}>
                <View style={[styles.corner, styles.cTL]} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
                <Text style={styles.guideLabel}>Placa del vehículo</Text>
              </View>
            </View>
            <View style={styles.captureArea}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setState('manual')} style={styles.manualBtn}>
                <Text style={styles.manualBtnText}>Ingresar manualmente</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    )
  }

  if (state === 'processing') {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
        <Text style={styles.processingTitle}>Buscando cliente...</Text>
      </View>
    )
  }

  if (state === 'manual') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setState('camera')} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ingresar placa</Text>
        </View>
        <View style={styles.manualContainer}>
          <Text style={styles.manualLabel}>Número de placa</Text>
          <TextInput
            style={styles.placaInput}
            value={placaManual}
            onChangeText={t => setPlacaManual(t.toUpperCase())}
            placeholder="Ej: ABC-123"
            autoCapitalize="characters"
            maxLength={8}
            placeholderTextColor={Colors.textMuted}
          />
          <Button
            label="Buscar cliente"
            onPress={() => buscarCliente(placaManual)}
            fullWidth
            style={styles.searchBtn}
          />
        </View>
      </SafeAreaView>
    )
  }

  if (state === 'notfound') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setState('camera')} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultado</Text>
        </View>
        <View style={styles.resultContainer}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" style={styles.notFoundIcon}><Path d="M5 17H3a2 2 0 01-2-2V9a7 7 0 017-7h8a7 7 0 017 7v6a2 2 0 01-2 2h-2M7 17h10M7.5 20.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16.5 20.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round"/><Path d="M18 3L6 15" stroke="#EF4444" strokeWidth={2} strokeLinecap="round"/></Svg>
          <Text style={styles.notFoundTitle}>Placa no registrada</Text>
          <Text style={styles.notFoundDesc}>Esta placa no está registrada en RepsolGo.</Text>
          <Button label="Intentar de nuevo" onPress={() => setState('camera')} fullWidth style={styles.retryBtn} />
        </View>
      </SafeAreaView>
    )
  }

  // found — confirm screen
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setCliente(null); setState('camera') }} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cliente encontrado</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.clienteCard}>
          <View style={styles.clienteAvatar}>
            <Text style={styles.clienteAvatarText}>
              {cliente?.nombre.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'CL'}
            </Text>
          </View>
          <Text style={styles.clienteNombre}>{cliente?.nombre}</Text>
          <View style={styles.placaBadge}>
            <Text style={styles.placaBadgeText}>{cliente?.placa}</Text>
          </View>
        </View>

        <View style={styles.puntosSection}>
          <Text style={styles.puntosLabel}>Puntos a acreditar</Text>
          <TextInput
            style={styles.puntosInput}
            value={puntos}
            onChangeText={setPuntos}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.puntosHint}>Ingresa los puntos según el monto de combustible cargado</Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={confirming ? 'Acreditando...' : `Acreditar ${puntos} puntos`}
            onPress={handleAcreditar}
            fullWidth
            style={styles.acreditarBtn}
          />
          <Button
            label="Cancelar"
            onPress={() => { setCliente(null); setState('camera') }}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const CORNER = 24
const THICK = 3

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.navy },
  permContainer: { flex: 1, backgroundColor: Colors.white },
  permContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permIcon: { fontSize: 64, marginBottom: 24 },
  permTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  permDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  deniedText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  permBtn: {},
  manualLink: { marginTop: 20 },
  manualLinkText: { color: Colors.orange, fontWeight: '600', fontSize: 15 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  cameraHeader: {
    backgroundColor: 'rgba(4,30,66,0.85)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cameraTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  cameraSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  guideArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideFrame: { width: 280, height: 80, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.orange },
  cTL: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: 4 },
  cTR: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: 4 },
  cBL: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: 4 },
  cBR: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: 4 },
  guideLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  captureArea: {
    backgroundColor: 'rgba(4,30,66,0.85)',
    paddingVertical: 28,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    elevation: 8,
  },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white, opacity: 0.2 },
  manualBtn: { marginTop: 16 },
  manualBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.navy },
  processingTitle: { fontSize: 18, color: Colors.white, marginTop: 20, fontWeight: '600' },
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: {
    backgroundColor: Colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  backArrow: { color: Colors.white, fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  manualContainer: { padding: 24 },
  manualLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  placaInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 22,
    fontWeight: '800', color: Colors.textPrimary, textAlign: 'center',
    letterSpacing: 4, backgroundColor: Colors.white,
  },
  searchBtn: { marginTop: 20 },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  notFoundIcon: { fontSize: 56, marginBottom: 20 },
  notFoundTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  notFoundDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  retryBtn: {},
  scroll: { flex: 1 },
  clienteCard: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  clienteAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.navy,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  clienteAvatarText: { color: Colors.white, fontSize: 24, fontWeight: '800' },
  clienteNombre: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  placaBadge: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 24, paddingVertical: 8, borderRadius: 10,
  },
  placaBadgeText: { color: Colors.white, fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  puntosSection: { marginHorizontal: 20, marginBottom: 24 },
  puntosLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  puntosInput: {
    borderWidth: 1.5, borderColor: Colors.orange, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 32,
    fontWeight: '800', color: Colors.orange, textAlign: 'center',
    backgroundColor: Colors.white,
  },
  puntosHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
  actions: { paddingHorizontal: 20, gap: 12 },
  acreditarBtn: {},
})

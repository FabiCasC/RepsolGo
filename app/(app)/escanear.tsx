import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg'
import { Colors } from '../../src/constants/colors'
import { Button } from '../../src/components/ui/Button'

function IcoCamera({ color = Colors.navy, size = 48 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoLightbulb({ color = 'rgba(255,255,255,0.7)', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21h6M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 016-6z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoCheckCircle({ color = '#16A34A', size = 36 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Polyline points="9,12 11,14 15,10" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type EscanearState = 'camera' | 'processing' | 'result'

interface BoletaData {
  grifo: string
  fecha: string
  litros: string
  monto: string
  combustible: string
  puntos: number
}

const MOCK_BOLETA: BoletaData = {
  grifo: 'Repsol Javier Prado Este',
  fecha: '14/10/2026',
  litros: '22L',
  monto: 'S/349.80',
  combustible: '95 oct',
  puntos: 120,
}

export default function EscanearScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [state, setState] = useState<EscanearState>('camera')
  const [boletaData, setBoletaData] = useState<BoletaData | null>(null)

  if (!permission) {
    return <View style={styles.loadingContainer} />
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconBox}>
            <IcoCamera color={Colors.navy} size={48} />
          </View>
          <Text style={styles.permissionTitle}>Necesitamos la cámara</Text>
          <Text style={styles.permissionDesc}>
            Para escanear tus boletas y acreditar los puntos automáticamente.
          </Text>
          <Button
            label="Conceder permiso"
            onPress={requestPermission}
            fullWidth
            style={styles.permissionBtn}
          />
        </View>
      </SafeAreaView>
    )
  }

  function handleCapture() {
    setState('processing')
    setTimeout(() => {
      setBoletaData(MOCK_BOLETA)
      setState('result')
    }, 2000)
  }

  function handleReset() {
    setBoletaData(null)
    setState('camera')
  }

  function handleConfirm() {
    Alert.alert(
      '¡Puntos acreditados!',
      `+${MOCK_BOLETA.puntos} puntos han sido añadidos a tu cuenta.`,
      [{ text: 'Genial', onPress: handleReset }]
    )
  }

  if (state === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back">
          <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Escanear boleta</Text>
              <Text style={styles.cameraSubtitle}>Encuadra la boleta dentro del marco</Text>
            </View>

            <View style={styles.guideContainer}>
              <View style={styles.guideFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Text style={styles.guideText}>Encuadra tu boleta aquí</Text>
              </View>
            </View>

            <View style={styles.captureArea}>
              <View style={styles.captureTipRow}>
                <IcoLightbulb />
                <Text style={styles.captureTip}>Asegúrate de que el texto sea legible</Text>
              </View>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    )
  }

  if (state === 'processing') {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={Colors.orange} />
        <Text style={styles.processingTitle}>Procesando boleta...</Text>
        <Text style={styles.processingSubtitle}>Reconociendo texto con OCR</Text>
        <View style={styles.processingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.resultContainer} edges={['top', 'bottom']}>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View style={styles.successBadge}>
            <IcoCheckCircle />
          </View>
          <Text style={styles.resultTitle}>Boleta reconocida</Text>
          <Text style={styles.resultSubtitle}>Confirma que los datos son correctos</Text>
        </View>

        <View style={styles.boletaCard}>
          <View style={styles.boletaHeader}>
            <Text style={styles.boletaGrifo}>{boletaData?.grifo}</Text>
            <Text style={styles.boletaFecha}>{boletaData?.fecha}</Text>
          </View>

          <View style={styles.boletaDivider} />

          <View style={styles.boletaRow}>
            <Text style={styles.boletaLabel}>Combustible</Text>
            <Text style={styles.boletaValue}>{boletaData?.combustible}</Text>
          </View>
          <View style={styles.boletaRow}>
            <Text style={styles.boletaLabel}>Litros</Text>
            <Text style={styles.boletaValue}>{boletaData?.litros}</Text>
          </View>
          <View style={styles.boletaRow}>
            <Text style={styles.boletaLabel}>Monto total</Text>
            <Text style={styles.boletaValueBig}>{boletaData?.monto}</Text>
          </View>

          <View style={styles.puntosCard}>
            <Text style={styles.puntosLabel}>Puntos a acreditar</Text>
            <Text style={styles.puntosValue}>+{boletaData?.puntos} pts</Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <Button
            label="Confirmar y canjear puntos"
            onPress={handleConfirm}
            fullWidth
            style={styles.confirmBtn}
          />
          <Button
            label="Volver a escanear"
            onPress={handleReset}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const CORNER_SIZE = 24
const CORNER_THICKNESS = 3

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionIconBox: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {},
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    backgroundColor: 'rgba(4,30,66,0.8)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  cameraSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFrame: {
    width: 300,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.orange,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  guideText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  captureArea: {
    backgroundColor: 'rgba(4,30,66,0.8)',
    paddingVertical: 32,
    alignItems: 'center',
  },
  captureTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  captureTip: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    opacity: 0.2,
  },
  processingContainer: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 24,
  },
  processingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  processingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: Colors.orange,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  resultContent: {
    flex: 1,
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  boletaCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  boletaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  boletaGrifo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  boletaFecha: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  boletaDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  boletaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  boletaLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  boletaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  boletaValueBig: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  puntosCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  puntosLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  puntosValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.orange,
  },
  resultActions: {
    gap: 12,
  },
  confirmBtn: {
    marginBottom: 0,
  },
})

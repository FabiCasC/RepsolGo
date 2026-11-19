import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/store/auth.store';

function IcoCalendar({ color = Colors.orange, size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoPin({ color = Colors.orange, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoClock({ color = Colors.textSecondary, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const HISTORIAL_MOCK = [
  { id: '1', fecha: 'Hoy', entrada: '07:58', salida: '16:02', duracion: '8h 04m', grifo: 'Repsol Javier Prado Este' },
  { id: '2', fecha: 'Ayer', entrada: '08:01', salida: '16:00', duracion: '7h 59m', grifo: 'Repsol Javier Prado Este' },
  { id: '3', fecha: '13 oct', entrada: '08:05', salida: '16:10', duracion: '8h 05m', grifo: 'Repsol Javier Prado Este' },
];

export default function TurnoScreen() {
  const user = useAuthStore(s => s.user);
  const [turnoActivo, setTurnoActivo] = useState(false);
  const [horaEntrada, setHoraEntrada] = useState('');
  const [cargando, setCargando] = useState(false);

  function getNow() {
    const now = new Date();
    return now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  function handleEntrada() {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      const hora = getNow();
      setHoraEntrada(hora);
      setTurnoActivo(true);
    }, 800);
  }

  function handleSalida() {
    Alert.alert(
      'Registrar salida',
      '¿Confirmas el fin de tu turno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            setCargando(true);
            setTimeout(() => {
              setCargando(false);
              setTurnoActivo(false);
              setHoraEntrada('');
            }, 800);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <IcoCalendar size={28} />
          <Text style={styles.title}>Registro de Turno</Text>
        </View>

        {/* Estado del turno */}
        <View style={[styles.estadoCard, turnoActivo ? styles.estadoActivo : styles.estadoInactivo]}>
          <View style={styles.estadoTop}>
            <View style={[styles.dot, turnoActivo ? styles.dotActivo : styles.dotInactivo]} />
            <Text style={[styles.estadoLabel, turnoActivo ? styles.estadoLabelActivo : styles.estadoLabelInactivo]}>
              {turnoActivo ? 'Turno en curso' : 'Sin turno activo'}
            </Text>
          </View>

          {turnoActivo && (
            <View style={styles.turnoInfo}>
              <View style={styles.turnoRow}>
                <IcoClock color={Colors.textSecondary} size={14} />
                <Text style={styles.turnoInfoText}>Entrada: {horaEntrada}</Text>
              </View>
              <View style={styles.turnoRow}>
                <IcoPin color={Colors.textSecondary} size={14} />
                <Text style={styles.turnoInfoText}>Repsol Javier Prado Este</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.btnTurno,
              turnoActivo ? styles.btnSalida : styles.btnEntrada,
              cargando && styles.btnDisabled,
            ]}
            onPress={turnoActivo ? handleSalida : handleEntrada}
            disabled={cargando}
            activeOpacity={0.8}
          >
            <Text style={styles.btnTurnoText}>
              {cargando ? 'Registrando...' : turnoActivo ? 'Registrar salida' : 'Registrar entrada'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grifo asignado */}
        <View style={styles.grifoCard}>
          <View style={styles.grifoRow}>
            <IcoPin color={Colors.orange} size={18} />
            <View style={styles.grifoTexts}>
              <Text style={styles.grifoNombre}>Repsol Javier Prado Este</Text>
              <Text style={styles.grifoDir}>Av. Javier Prado Este 4200, La Molina</Text>
            </View>
          </View>
          <View style={styles.operarioBadge}>
            <Text style={styles.operarioText}>{user?.name ?? 'Operario'}</Text>
          </View>
        </View>

        {/* Historial */}
        <Text style={styles.sectionTitle}>Historial reciente</Text>
        {HISTORIAL_MOCK.map(item => (
          <View key={item.id} style={styles.histItem}>
            <View>
              <Text style={styles.histFecha}>{item.fecha}</Text>
              <Text style={styles.histGrifo}>{item.grifo}</Text>
            </View>
            <View style={styles.histRight}>
              <Text style={styles.histEntrada}>{item.entrada} — {item.salida}</Text>
              <Text style={styles.histDuracion}>{item.duracion}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },

  estadoCard: {
    borderRadius: 16, borderWidth: 1.5,
    padding: 16, marginBottom: 16,
  },
  estadoActivo: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  estadoInactivo: { backgroundColor: '#F9FAFB', borderColor: Colors.border },

  estadoTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActivo: { backgroundColor: '#22C55E' },
  dotInactivo: { backgroundColor: Colors.textMuted },
  estadoLabel: { fontSize: 15, fontWeight: '700' },
  estadoLabelActivo: { color: '#15803D' },
  estadoLabelInactivo: { color: Colors.textSecondary },

  turnoInfo: { gap: 6, marginBottom: 14 },
  turnoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  turnoInfoText: { fontSize: 13, color: Colors.textSecondary },

  btnTurno: {
    borderRadius: 12, paddingVertical: 13,
    alignItems: 'center',
  },
  btnEntrada: { backgroundColor: Colors.orange },
  btnSalida: { backgroundColor: '#EF4444' },
  btnDisabled: { opacity: 0.5 },
  btnTurnoText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  grifoCard: {
    backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    padding: 14, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  grifoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  grifoTexts: { flex: 1 },
  grifoNombre: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  grifoDir: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  operarioBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  operarioText: { fontSize: 11, fontWeight: '600', color: '#4338CA' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },

  histItem: {
    backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    padding: 14, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  histFecha: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  histGrifo: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histEntrada: { fontSize: 12, color: Colors.textSecondary },
  histDuracion: { fontSize: 13, fontWeight: '700', color: Colors.orange, marginTop: 2 },
});

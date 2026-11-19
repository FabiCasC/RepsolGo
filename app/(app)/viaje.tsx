import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

function IcoRuta({ color = Colors.orange, size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5" cy="6" r="2" stroke={color} strokeWidth={1.8} />
      <Circle cx="19" cy="18" r="2" stroke={color} strokeWidth={1.8} />
      <Path d="M5 8v5a3 3 0 003 3h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 14l2 2-2 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IcoGasPump({ color = Colors.orange, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="5" y1="6" x2="11" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="22" x2="13" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IcoClock({ color = Colors.textSecondary, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const GRIFOS_RUTA = [
  { id: '1', nombre: 'Repsol Lurín Km 32', distancia: '32 km', tiempo: '28 min', precio90: 16.49, precio95: 18.29, espera: '~3 min', disponible: true },
  { id: '2', nombre: 'Repsol Chincha Norte', distancia: '67 km', tiempo: '55 min', precio90: 16.29, precio95: 18.09, espera: '~10 min', disponible: true },
  { id: '3', nombre: 'Repsol Ica Eje Central', distancia: '110 km', tiempo: '1h 28 min', precio90: 16.19, precio95: 17.99, espera: '~5 min', disponible: true },
  { id: '4', nombre: 'Repsol Nasca Norte', distancia: '185 km', tiempo: '2h 15 min', precio90: 16.09, precio95: 17.89, espera: '~2 min', disponible: false },
];

export default function ViajeScreen() {
  const [destino, setDestino] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [mostrarGrifos, setMostrarGrifos] = useState(false);

  function handleBuscar() {
    if (!destino.trim()) return;
    setBuscando(true);
    setTimeout(() => {
      setBuscando(false);
      setMostrarGrifos(true);
    }, 1200);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <IcoRuta size={28} />
          <Text style={styles.title}>Modo Viaje</Text>
        </View>
        <Text style={styles.subtitle}>
          Ingresa tu destino y te mostramos todos los grifos Repsol en ruta con precios y disponibilidad.
        </Text>

        {/* Buscador */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="¿A dónde vas? (ej: Ica, Nasca, Arequipa)"
            placeholderTextColor={Colors.textMuted}
            value={destino}
            onChangeText={setDestino}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.btnBuscar, !destino.trim() && styles.btnDisabled]}
            onPress={handleBuscar}
            disabled={!destino.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{buscando ? 'Buscando...' : 'Buscar ruta'}</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {mostrarGrifos && (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {GRIFOS_RUTA.length} grifos Repsol en ruta a {destino}
              </Text>
            </View>

            {GRIFOS_RUTA.map(grifo => (
              <View key={grifo.id} style={[styles.grifoCard, !grifo.disponible && styles.grifoCardOff]}>
                <View style={styles.grifoTop}>
                  <View style={styles.grifoIconWrap}>
                    <IcoGasPump color={grifo.disponible ? Colors.orange : Colors.textMuted} size={20} />
                  </View>
                  <View style={styles.grifoInfo}>
                    <Text style={[styles.grifoNombre, !grifo.disponible && styles.textOff]}>
                      {grifo.nombre}
                    </Text>
                    <View style={styles.grifoMeta}>
                      <Text style={styles.grifoDistancia}>{grifo.distancia}</Text>
                      <Text style={styles.sep}>·</Text>
                      <IcoClock />
                      <Text style={styles.grifoTiempo}> {grifo.tiempo}</Text>
                    </View>
                  </View>
                  {!grifo.disponible && (
                    <View style={styles.cerradoBadge}>
                      <Text style={styles.cerradoText}>Cerrado</Text>
                    </View>
                  )}
                </View>

                {grifo.disponible && (
                  <View style={styles.grifoBottom}>
                    <View style={styles.precioChip}>
                      <Text style={styles.precioLabel}>90 oct</Text>
                      <Text style={styles.precioValor}>S/ {grifo.precio90.toFixed(2)}</Text>
                    </View>
                    <View style={styles.precioChip}>
                      <Text style={styles.precioLabel}>95 oct</Text>
                      <Text style={styles.precioValor}>S/ {grifo.precio95.toFixed(2)}</Text>
                    </View>
                    <View style={styles.esperaChip}>
                      <IcoClock color={Colors.green} size={12} />
                      <Text style={styles.esperaText}> {grifo.espera}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Placeholder vacío */}
        {!mostrarGrifos && !buscando && (
          <View style={styles.emptyState}>
            <IcoRuta color={Colors.textMuted} size={48} />
            <Text style={styles.emptyTitle}>Planifica tu viaje</Text>
            <Text style={styles.emptyText}>
              Ingresa tu destino arriba para ver los grifos Repsol disponibles en la ruta con precios actualizados.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 18 },

  searchBox: { gap: 10, marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  btnBuscar: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
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
  grifoNombre: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  textOff: { color: Colors.textMuted },
  grifoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  grifoDistancia: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  sep: { color: Colors.textMuted },
  grifoTiempo: { fontSize: 12, color: Colors.textSecondary },
  cerradoBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cerradoText: { fontSize: 11, color: '#DC2626', fontWeight: '600' },

  grifoBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  precioChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: 'row', gap: 4,
  },
  precioLabel: { fontSize: 11, color: Colors.textSecondary },
  precioValor: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  esperaChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  esperaText: { fontSize: 11, color: Colors.green, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

function IcoAlerta({ color = Colors.red, size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IcoCamera({ color = Colors.orange, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

const CATEGORIAS = [
  { id: 'derrame', label: 'Derrame' },
  { id: 'falla', label: 'Falla de surtidor' },
  { id: 'accidente', label: 'Accidente' },
  { id: 'otro', label: 'Otro' },
];

const HISTORIAL_MOCK = [
  { id: '1', categoria: 'Falla de surtidor', descripcion: 'Surtidor 3 no dispensa correctamente', fecha: 'Hoy 09:14', estado: 'Enviado' },
  { id: '2', categoria: 'Derrame', descripcion: 'Pequeño derrame en la isla 2', fecha: 'Ayer 15:30', estado: 'Revisado' },
];

export default function IncidenciasScreen() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleEnviar() {
    if (!categoriaSeleccionada) {
      Alert.alert('Categoría requerida', 'Selecciona el tipo de incidencia.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Descripción requerida', 'Agrega una descripción breve de la incidencia.');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setCategoriaSeleccionada('');
      setDescripcion('');
      Alert.alert('Incidencia enviada', 'El reporte fue enviado a la central de Repsol con tu ubicación y hora.');
    }, 1000);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <IcoAlerta size={28} />
          <Text style={styles.title}>Reportar Incidencia</Text>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de incidencia</Text>
          <View style={styles.categoriasGrid}>
            {CATEGORIAS.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoriaChip,
                  categoriaSeleccionada === cat.id && styles.categoriaChipActive,
                ]}
                onPress={() => setCategoriaSeleccionada(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.categoriaText,
                  categoriaSeleccionada === cat.id && styles.categoriaTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Descripción</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe brevemente qué ocurrió..."
            placeholderTextColor={Colors.textMuted}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.btnFoto} activeOpacity={0.8}>
            <IcoCamera color={Colors.orange} size={18} />
            <Text style={styles.btnFotoText}>Adjuntar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnEnviar, enviando && styles.btnDisabled]}
            onPress={handleEnviar}
            disabled={enviando}
            activeOpacity={0.8}
          >
            <Text style={styles.btnEnviarText}>{enviando ? 'Enviando...' : 'Enviar reporte'}</Text>
          </TouchableOpacity>
        </View>

        {/* Historial */}
        <Text style={styles.sectionTitle}>Mis reportes recientes</Text>
        {HISTORIAL_MOCK.map(item => (
          <View key={item.id} style={styles.historialItem}>
            <View style={styles.historialLeft}>
              <Text style={styles.historialCategoria}>{item.categoria}</Text>
              <Text style={styles.historialDesc}>{item.descripcion}</Text>
              <Text style={styles.historialFecha}>{item.fecha}</Text>
            </View>
            <View style={[
              styles.estadoBadge,
              item.estado === 'Revisado' && styles.estadoBadgeOk,
            ]}>
              <Text style={[
                styles.estadoText,
                item.estado === 'Revisado' && styles.estadoTextOk,
              ]}>
                {item.estado}
              </Text>
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

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },

  categoriasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoriaChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoriaChipActive: { borderColor: Colors.orange, backgroundColor: '#FFF3E0' },
  categoriaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  categoriaTextActive: { color: Colors.orange, fontWeight: '700' },

  textarea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 90,
  },

  btnFoto: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.orange, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  btnFotoText: { fontSize: 13, fontWeight: '600', color: Colors.orange },

  btnEnviar: {
    backgroundColor: Colors.red,
    borderRadius: 12, paddingVertical: 13,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnEnviarText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },

  historialItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historialLeft: { flex: 1 },
  historialCategoria: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  historialDesc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  historialFecha: { fontSize: 11, color: Colors.textMuted },

  estadoBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  estadoBadgeOk: { backgroundColor: '#F0FDF4' },
  estadoText: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  estadoTextOk: { color: '#16A34A' },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';
import { RetoCard } from '@/src/components/gamificacion/RetoCard';
import { BadgeGrid } from '@/src/components/gamificacion/BadgeGrid';
import type { Reto, Badge } from '@/src/types';

function IcoFlame({ color = '#EF4444', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoTrophy({ color = Colors.orange, size = 28 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h1M17 4h3a1 1 0 011 1v2a4 4 0 01-4 4h-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 4h8v9a4 4 0 01-8 0V4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

const RETOS_MOCK: Reto[] = [
  {
    id: '1',
    titulo: 'Cargador Constante',
    descripcion: 'Carga combustible 3 veces este mes',
    progreso: 2,
    meta: 3,
    puntos: 500,
    xp: 100,
    color: Colors.orange,
    icono: 'zap',
    fechaVencimiento: '31 oct',
  },
  {
    id: '2',
    titulo: 'Madrugador',
    descripcion: 'Primera carga del mes antes del día 5',
    progreso: 1,
    meta: 1,
    puntos: 200,
    xp: 50,
    color: '#F59E0B',
    icono: 'sunrise',
    fechaVencimiento: '5 nov',
  },
  {
    id: '3',
    titulo: 'Explorador',
    descripcion: 'Carga en 2 grifos Repsol distintos',
    progreso: 1,
    meta: 2,
    puntos: 200,
    xp: 60,
    color: '#10B981',
    icono: 'map',
    fechaVencimiento: '31 oct',
  },
];

const BADGES_MOCK: Badge[] = [
  { id: 'b1', nombre: 'Primer Tanque', icono: 'rocket', color: '#6366F1', ganado: true },
  { id: 'b2', nombre: '10 Cargas', icono: 'star', color: Colors.orange, ganado: true },
  { id: 'b3', nombre: 'Eco-Amigo', icono: 'heart', color: '#22C55E', ganado: true },
  { id: 'b4', nombre: 'Explorador', icono: 'map', color: '#10B981', ganado: false },
  { id: 'b5', nombre: '50 Cargas', icono: 'diamond', color: '#06B6D4', ganado: false },
  { id: 'b6', nombre: 'Fundador', icono: 'crown', color: '#F59E0B', ganado: false },
  { id: 'b7', nombre: 'Viajero', icono: 'sunrise', color: '#8B5CF6', ganado: false },
  { id: 'b8', nombre: 'Top Cargador', icono: 'piggy', color: '#EF4444', ganado: false },
];

export default function GamificacionScreen() {
  const rachaDias = 5;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <IcoTrophy size={28} />
          <Text style={styles.title}>Retos y Logros</Text>
        </View>

        {/* Racha */}
        <View style={styles.rachaCard}>
          <View style={styles.rachaLeft}>
            <IcoFlame color="#EF4444" size={20} />
            <Text style={styles.rachaLabel}>Racha activa</Text>
          </View>
          <Text style={styles.rachaDias}>{rachaDias} días</Text>
        </View>

        {/* Retos activos */}
        <Text style={styles.sectionTitle}>Retos del mes</Text>
        {RETOS_MOCK.map(reto => (
          <RetoCard key={reto.id} reto={reto} />
        ))}

        {/* Badges */}
        <Text style={styles.sectionTitle}>Mis badges</Text>
        <View style={styles.badgesWrap}>
          <BadgeGrid badges={BADGES_MOCK} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },

  rachaCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FBBF24',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rachaLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rachaLabel: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  rachaDias: { fontSize: 20, fontWeight: '800', color: '#EF4444' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },

  badgesWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
});

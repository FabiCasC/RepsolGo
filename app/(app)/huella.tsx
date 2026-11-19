import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

const COMBUSTIBLES = {
  '90 Oct': 2.31,
  '95 Oct': 2.31,
  '97 Oct': 2.31,
  'Diesel B5': 2.68,
};

const HISTORIAL_MOCK = [
  { mes: 'Nov 2026', litros: 85, tipo: '95 Oct', co2: 196.35 },
  { mes: 'Oct 2026', litros: 92, tipo: '90 Oct', co2: 212.52 },
  { mes: 'Sep 2026', litros: 78, tipo: '95 Oct', co2: 180.18 },
  { mes: 'Ago 2026', litros: 110, tipo: 'Diesel B5', co2: 294.80 },
];

const COMPENSACIONES = [
  { id: '1', nombre: 'Siembra 1 árbol', puntos: 500, descripcion: 'Absorbe ~21 kg CO₂/año', icono: '🌳' },
  { id: '2', nombre: 'Energía solar x1 día', puntos: 300, descripcion: 'Evita 2 kg CO₂', icono: '☀️' },
  { id: '3', nombre: 'Certificado verde', puntos: 1000, descripcion: 'Offset 10 kg CO₂', icono: '🌿' },
];

export default function HuellaCarbonoScreen() {
  const [tab, setTab] = useState<'huella'|'compensar'>('huella');
  const [puntosMock] = useState(2450);

  const actual = HISTORIAL_MOCK[0];
  const anterior = HISTORIAL_MOCK[1];
  const variacion = (((actual.co2 - anterior.co2) / anterior.co2) * 100).toFixed(1);
  const mejoró = actual.co2 < anterior.co2;

  const maxCo2 = Math.max(...HISTORIAL_MOCK.map(h => h.co2));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.titulo}>Huella de Carbono</Text>
        <Text style={s.subtitulo}>Tu impacto ambiental personal</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'huella' && s.tabActivo]} onPress={() => setTab('huella')}>
          <Text style={[s.tabTxt, tab === 'huella' && s.tabTxtActivo]}>🌍 Mi huella</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'compensar' && s.tabActivo]} onPress={() => setTab('compensar')}>
          <Text style={[s.tabTxt, tab === 'compensar' && s.tabTxtActivo]}>💚 Compensar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'huella' ? (
          <>
            <View style={s.heroBg}>
              <View style={s.heroCard}>
                <Text style={s.heroLabel}>Este mes emitiste</Text>
                <Text style={s.heroNum}>{actual.co2.toFixed(1)}</Text>
                <Text style={s.heroUnit}>kg CO₂</Text>
                <View style={s.heroVariacion}>
                  <Text style={[s.heroVariacionTxt, { color: mejoró ? Colors.green : Colors.red }]}>
                    {mejoró ? '▼' : '▲'} {Math.abs(parseFloat(variacion))}% vs mes anterior
                  </Text>
                </View>
                <Text style={s.heroDetalle}>{actual.litros} litros · {actual.tipo}</Text>
              </View>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Comparativa mensual</Text>
              <View style={s.barras}>
                {HISTORIAL_MOCK.map((h, i) => (
                  <View key={i} style={s.barraCol}>
                    <Text style={s.barraCo2}>{h.co2.toFixed(0)}</Text>
                    <View style={s.barraWrap}>
                      <View style={[s.barra, { height: (h.co2 / maxCo2) * 100, backgroundColor: i === 0 ? Colors.orange : Colors.navyMid }]} />
                    </View>
                    <Text style={s.barraMes}>{h.mes.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Factor por combustible</Text>
              {Object.entries(COMBUSTIBLES).map(([tipo, factor]) => (
                <View key={tipo} style={s.factorRow}>
                  <Text style={s.factorNombre}>{tipo}</Text>
                  <Text style={s.factorVal}>{factor} kg CO₂/litro</Text>
                </View>
              ))}
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Consejo del mes</Text>
              <View style={s.consejo}>
                <Text style={s.consejoIco}>💡</Text>
                <Text style={s.consejoTxt}>
                  Si reduces 10 litros de consumo mensual, evitas <Text style={{ fontWeight: '800', color: Colors.green }}>23 kg de CO₂</Text>. Equivale a plantar 1 árbol pequeño.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={s.puntosHeader}>
              <Text style={s.puntosLabel}>Puntos verdes disponibles</Text>
              <Text style={s.puntosNum}>💚 {puntosMock.toLocaleString()} pts</Text>
            </View>

            <Text style={s.compensarSubtitulo}>
              Canjea tus puntos Repsol por acciones de compensación ambiental
            </Text>

            {COMPENSACIONES.map(item => (
              <View key={item.id} style={s.compCard}>
                <Text style={s.compIco}>{item.icono}</Text>
                <View style={s.compInfo}>
                  <Text style={s.compNombre}>{item.nombre}</Text>
                  <Text style={s.compDesc}>{item.descripcion}</Text>
                </View>
                <View style={s.compDer}>
                  <Text style={s.compPts}>{item.puntos} pts</Text>
                  <TouchableOpacity
                    style={[s.compBtn, puntosMock < item.puntos && s.compBtnDisabled]}
                    disabled={puntosMock < item.puntos}
                  >
                    <Text style={s.compBtnTxt}>Canjear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={s.infoBox}>
              <Text style={s.infoTxt}>
                🌿 RepsolGo compensa en alianza con organizaciones de reforestación en Perú. Cada acción tiene un impacto real y medible.
              </Text>
            </View>
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: '#1A6B3C' },
  titulo: { fontSize: 22, fontWeight: '800', color: Colors.white },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: Colors.green },
  tabTxt: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  tabTxtActivo: { color: Colors.green },
  scroll: { flex: 1 },
  heroBg: { backgroundColor: '#1A6B3C', paddingBottom: 24, paddingHorizontal: 20 },
  heroCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 20, alignItems: 'center' },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  heroNum: { fontSize: 52, fontWeight: '900', color: Colors.white, lineHeight: 56 },
  heroUnit: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  heroVariacion: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  heroVariacionTxt: { fontSize: 13, fontWeight: '700' },
  heroDetalle: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  section: { backgroundColor: Colors.white, margin: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  barras: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 130 },
  barraCol: { alignItems: 'center', flex: 1 },
  barraCo2: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
  barraWrap: { width: 32, height: 100, justifyContent: 'flex-end' },
  barra: { width: 32, borderRadius: 4 },
  barraMes: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  factorRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  factorNombre: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  factorVal: { fontSize: 13, color: Colors.textMuted },
  consejo: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, gap: 10 },
  consejoIco: { fontSize: 20 },
  consejoTxt: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  puntosHeader: { backgroundColor: '#1A6B3C', padding: 20, alignItems: 'center' },
  puntosLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  puntosNum: { fontSize: 26, fontWeight: '900', color: Colors.white, marginTop: 4 },
  compensarSubtitulo: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  compCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  compIco: { fontSize: 32, marginRight: 12 },
  compInfo: { flex: 1 },
  compNombre: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  compDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  compDer: { alignItems: 'center', gap: 6 },
  compPts: { fontSize: 13, fontWeight: '800', color: Colors.green },
  compBtn: { backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  compBtnDisabled: { backgroundColor: Colors.border },
  compBtnTxt: { fontSize: 12, fontWeight: '700', color: Colors.white },
  infoBox: { backgroundColor: '#F0FDF4', margin: 16, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BBF7D0' },
  infoTxt: { fontSize: 13, color: '#166534', lineHeight: 19 },
});

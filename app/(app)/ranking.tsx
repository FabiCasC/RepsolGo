import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Star, Polygon } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

const GRIFOS_MOCK = [
  { id: '1', nombre: 'Grifo Miraflores Centro', direccion: 'Av. Larco 345, Miraflores', limpieza: 4.8, atencion: 4.9, velocidad: 4.7, votos: 234, favorito: false },
  { id: '2', nombre: 'Grifo San Isidro Norte', direccion: 'Av. Javier Prado 1200, San Isidro', limpieza: 4.6, atencion: 4.5, velocidad: 4.8, votos: 189, favorito: true },
  { id: '3', nombre: 'Grifo Surco Principal', direccion: 'Av. Primavera 890, Surco', limpieza: 4.4, atencion: 4.6, velocidad: 4.3, votos: 156, favorito: false },
  { id: '4', nombre: 'Grifo La Molina', direccion: 'Av. La Molina 450, La Molina', limpieza: 4.2, atencion: 4.0, velocidad: 4.5, votos: 98, favorito: false },
  { id: '5', nombre: 'Grifo Barranco', direccion: 'Av. Grau 234, Barranco', limpieza: 3.9, atencion: 4.2, velocidad: 3.8, votos: 72, favorito: false },
];

function promedio(g: typeof GRIFOS_MOCK[0]) {
  return ((g.limpieza + g.atencion + g.velocidad) / 3).toFixed(1);
}

function StarRow({ valor, label }: { valor: number; label: string }) {
  return (
    <View style={s.starRow}>
      <Text style={s.starLabel}>{label}</Text>
      <View style={s.starsWrap}>
        {[1,2,3,4,5].map(i => (
          <Svg key={i} width={10} height={10} viewBox="0 0 24 24">
            <Polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={i <= Math.round(valor) ? Colors.orange : '#E5E7EB'}
              stroke={i <= Math.round(valor) ? Colors.orange : '#E5E7EB'}
              strokeWidth={1}
            />
          </Svg>
        ))}
        <Text style={s.starNum}>{valor.toFixed(1)}</Text>
      </View>
    </View>
  );
}

function MedallaBadge({ pos }: { pos: number }) {
  const colores: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
  if (pos > 3) return <Text style={s.posNum}>#{pos}</Text>;
  return (
    <View style={[s.medalla, { backgroundColor: colores[pos] }]}>
      <Text style={s.medallaText}>{pos}</Text>
    </View>
  );
}

type Filtro = 'general' | 'limpieza' | 'atencion' | 'velocidad';

export default function RankingGrifosScreen() {
  const [filtro, setFiltro] = useState<Filtro>('general');
  const [busqueda, setBusqueda] = useState('');
  const [votando, setVotando] = useState<string | null>(null);
  const [votos, setVotos] = useState<Record<string, Record<string, number>>>({});

  const grifos = [...GRIFOS_MOCK]
    .filter(g => g.nombre.toLowerCase().includes(busqueda.toLowerCase()) || g.direccion.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (filtro === 'limpieza') return b.limpieza - a.limpieza;
      if (filtro === 'atencion') return b.atencion - a.atencion;
      if (filtro === 'velocidad') return b.velocidad - a.velocidad;
      return parseFloat(promedio(b)) - parseFloat(promedio(a));
    });

  function votar(grifoId: string, cat: string, val: number) {
    setVotos(prev => ({ ...prev, [grifoId]: { ...(prev[grifoId] || {}), [cat]: val } }));
  }

  function enviarVoto(grifoId: string) {
    setVotando(null);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.titulo}>Ranking de Grifos</Text>
        <Text style={s.subtitulo}>Votado por la comunidad RepsolGo</Text>
      </View>

      <View style={s.searchBar}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <Circle cx="11" cy="11" r="8" stroke={Colors.textMuted} strokeWidth={2} />
          <Path d="M21 21l-4.35-4.35" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar grifo..."
          placeholderTextColor={Colors.textMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtroScroll} contentContainerStyle={s.filtros}>
        {(['general','limpieza','atencion','velocidad'] as Filtro[]).map(f => (
          <TouchableOpacity key={f} style={[s.filtroBtn, filtro === f && s.filtroBtnActivo]} onPress={() => setFiltro(f)}>
            <Text style={[s.filtroTxt, filtro === f && s.filtroTxtActivo]}>
              {f === 'general' ? '⭐ General' : f === 'limpieza' ? '🧹 Limpieza' : f === 'atencion' ? '😊 Atención' : '⚡ Velocidad'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.lista} showsVerticalScrollIndicator={false}>
        {grifos.map((g, idx) => (
          <View key={g.id} style={s.card}>
            <View style={s.cardTop}>
              <View style={s.posWrap}><MedallaBadge pos={idx + 1} /></View>
              <View style={s.cardInfo}>
                <Text style={s.cardNombre}>{g.nombre}</Text>
                <Text style={s.cardDir}>{g.direccion}</Text>
                <Text style={s.cardVotos}>{g.votos} votos</Text>
              </View>
              <View style={s.promedioWrap}>
                <Text style={s.promedioNum}>{promedio(g)}</Text>
                <Text style={s.promedioLbl}>/ 5.0</Text>
              </View>
            </View>
            <View style={s.cardStars}>
              <StarRow valor={g.limpieza} label="Limpieza" />
              <StarRow valor={g.atencion} label="Atención" />
              <StarRow valor={g.velocidad} label="Velocidad" />
            </View>
            {votando === g.id ? (
              <View style={s.votarForm}>
                <Text style={s.votarTitle}>Tu calificación</Text>
                {(['limpieza','atencion','velocidad'] as const).map(cat => (
                  <View key={cat} style={s.votarCat}>
                    <Text style={s.votarCatLabel}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</Text>
                    <View style={s.votarEstrellas}>
                      {[1,2,3,4,5].map(n => (
                        <TouchableOpacity key={n} onPress={() => votar(g.id, cat, n)}>
                          <Svg width={28} height={28} viewBox="0 0 24 24">
                            <Polygon
                              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                              fill={n <= (votos[g.id]?.[cat] || 0) ? Colors.orange : '#E5E7EB'}
                              stroke={n <= (votos[g.id]?.[cat] || 0) ? Colors.orange : '#E5E7EB'}
                              strokeWidth={1}
                            />
                          </Svg>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                <View style={s.votarBtns}>
                  <TouchableOpacity style={s.votarCancel} onPress={() => setVotando(null)}>
                    <Text style={s.votarCancelTxt}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.votarEnviar} onPress={() => enviarVoto(g.id)}>
                    <Text style={s.votarEnviarTxt}>Enviar voto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={s.votarBtn} onPress={() => setVotando(g.id)}>
                <Text style={s.votarBtnTxt}>⭐ Calificar este grifo</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.navy },
  titulo: { fontSize: 22, fontWeight: '800', color: Colors.white },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, margin: 16, marginBottom: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  filtroScroll: { maxHeight: 44 },
  filtros: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filtroBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filtroBtnActivo: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  filtroTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filtroTxtActivo: { color: Colors.white },
  lista: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  posWrap: { width: 36, alignItems: 'center', marginRight: 8, marginTop: 2 },
  medalla: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  medallaText: { fontSize: 13, fontWeight: '800', color: Colors.white },
  posNum: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardDir: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardVotos: { fontSize: 11, color: Colors.orange, marginTop: 3, fontWeight: '600' },
  promedioWrap: { alignItems: 'center' },
  promedioNum: { fontSize: 24, fontWeight: '900', color: Colors.orange },
  promedioLbl: { fontSize: 11, color: Colors.textMuted },
  cardStars: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 4 },
  starRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starLabel: { fontSize: 12, color: Colors.textSecondary, width: 70 },
  starsWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  starNum: { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
  votarBtn: { marginTop: 12, backgroundColor: Colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  votarBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.orange },
  votarForm: { marginTop: 12, backgroundColor: Colors.surface, borderRadius: 10, padding: 12 },
  votarTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  votarCat: { marginBottom: 8 },
  votarCatLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  votarEstrellas: { flexDirection: 'row', gap: 4 },
  votarBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  votarCancel: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  votarCancelTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  votarEnviar: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.orange },
  votarEnviarTxt: { fontSize: 13, color: Colors.white, fontWeight: '700' },
});

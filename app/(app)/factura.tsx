import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';
import { FirestoreService, type CargaData } from '@/src/services/firestore.service';
import { useAuthStore } from '@/src/store/auth.store';
import {
  doc, updateDoc, collection, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

type TipoComprobante = 'boleta' | 'factura';
type CargaConId = CargaData & { id: string; comprobante?: string };

function generarNumeroComprobante(tipo: TipoComprobante): string {
  const serie = tipo === 'boleta' ? 'B001' : 'F001';
  const numero = String(Math.floor(10000 + Math.random() * 90000));
  return `${serie}-${numero}`;
}

export default function FacturaScreen() {
  const { user } = useAuthStore();
  const [cargas, setCargas] = useState<CargaConId[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [tipoComp, setTipoComp] = useState<TipoComprobante>('boleta');
  const [ruc, setRuc] = useState('');
  const [razon, setRazon] = useState('');
  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    try {
      const data = await FirestoreService.getCargas(user.id);
      setCargas(data as CargaConId[]);
    } catch (e) {
      console.error('Error cargando cargas:', e);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  async function handleGenerar() {
    if (!user || !seleccionada) return;
    if (tipoComp === 'factura' && (!ruc || !razon)) return;
    setGenerando(true);
    try {
      const numero = generarNumeroComprobante(tipoComp);
      // Guardar comprobante en subcolección del usuario
      await addDoc(collection(db, 'users', user.id, 'comprobantes'), {
        cargaId: seleccionada,
        tipo: tipoComp,
        numero,
        ruc: tipoComp === 'factura' ? ruc : null,
        razonSocial: tipoComp === 'factura' ? razon : null,
        emitidoEn: serverTimestamp(),
      });
      // Marcar la carga con el número de comprobante
      await updateDoc(doc(db, 'users', user.id, 'cargas', seleccionada), {
        comprobante: numero,
      });
      setGenerado(numero);
      // Refrescar lista
      setCargas(prev => prev.map(c => c.id === seleccionada ? { ...c, comprobante: numero } : c));
    } catch (e) {
      console.error('Error generando comprobante:', e);
    } finally {
      setGenerando(false);
    }
  }

  const cargaActual = cargas.find(c => c.id === seleccionada);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.titulo}>Comprobante Electrónico</Text>
        <Text style={s.subtitulo}>Genera tu boleta o factura por cada carga</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={Colors.orange} size="large" />
            <Text style={s.loadingTxt}>Cargando tu historial...</Text>
          </View>
        ) : !seleccionada ? (
          <>
            <Text style={s.sectionLabel}>Selecciona una carga</Text>
            {cargas.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyTxt}>No tienes cargas registradas aún.</Text>
                <Text style={s.emptySubTxt}>Realiza una carga en un grifo Repsol para generar tu comprobante.</Text>
              </View>
            ) : cargas.map(c => (
              <TouchableOpacity key={c.id} style={s.cargaCard} onPress={() => { setSeleccionada(c.id); setGenerado(null); }}>
                <View style={s.cargaTop}>
                  <View>
                    <Text style={s.cargaFecha}>{c.fecha}</Text>
                    <Text style={s.cargaGrifo}>{c.grifoNombre}</Text>
                  </View>
                  <Text style={s.cargaMonto}>{c.monto}</Text>
                </View>
                <View style={s.cargaBot}>
                  <Text style={s.cargaDetalle}>{c.litros} · {c.combustible}</Text>
                  {c.comprobante ? (
                    <View style={s.compBadge}><Text style={s.compBadgeTxt}>✓ {c.comprobante}</Text></View>
                  ) : (
                    <View style={s.pendienteBadge}><Text style={s.pendienteBadgeTxt}>Pendiente</Text></View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : generado ? (
          <View style={s.exito}>
            <View style={s.exitoIco}><Text style={{ fontSize: 48 }}>✅</Text></View>
            <Text style={s.exitoTitulo}>¡Comprobante generado!</Text>
            <Text style={s.exitoNum}>{generado}</Text>
            <Text style={s.exitoDesc}>
              Se ha guardado en tu historial.{'\n'}Presentalo en el grifo si lo necesitas.
            </Text>
            <View style={s.exitoDetalle}>
              <Text style={s.exitoDetalleRow}>📍 {cargaActual?.grifoNombre}</Text>
              <Text style={s.exitoDetalleRow}>📅 {cargaActual?.fecha}</Text>
              <Text style={s.exitoDetalleRow}>⛽ {cargaActual?.litros} · {cargaActual?.combustible}</Text>
              <Text style={s.exitoDetalleRow}>💰 {cargaActual?.monto}</Text>
            </View>
            <TouchableOpacity style={s.volverBtn} onPress={() => { setSeleccionada(null); setGenerado(null); }}>
              <Text style={s.volverBtnTxt}>Generar otro comprobante</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={s.resumenCarga}>
              <TouchableOpacity style={s.volverLink} onPress={() => setSeleccionada(null)}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M19 12H5M12 19l-7-7 7-7" stroke={Colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={s.volverLinkTxt}>Cambiar carga</Text>
              </TouchableOpacity>
              <Text style={s.resumenTitulo}>{cargaActual?.grifoNombre}</Text>
              <Text style={s.resumenFecha}>{cargaActual?.fecha} · {cargaActual?.litros} · {cargaActual?.combustible}</Text>
              <Text style={s.resumenMonto}>{cargaActual?.monto}</Text>
            </View>

            <View style={s.formSection}>
              <Text style={s.formTitulo}>Tipo de comprobante</Text>
              <View style={s.tipoRow}>
                <TouchableOpacity style={[s.tipoBtn, tipoComp === 'boleta' && s.tipoBtnActivo]} onPress={() => setTipoComp('boleta')}>
                  <Text style={[s.tipoTxt, tipoComp === 'boleta' && s.tipoTxtActivo]}>🧾 Boleta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tipoBtn, tipoComp === 'factura' && s.tipoBtnActivo]} onPress={() => setTipoComp('factura')}>
                  <Text style={[s.tipoTxt, tipoComp === 'factura' && s.tipoTxtActivo]}>📋 Factura</Text>
                </TouchableOpacity>
              </View>

              {tipoComp === 'factura' && (
                <View style={s.facturaFields}>
                  <Text style={s.fieldLabel}>RUC de la empresa</Text>
                  <TextInput
                    style={s.input}
                    placeholder="20123456789"
                    placeholderTextColor={Colors.textMuted}
                    value={ruc}
                    onChangeText={setRuc}
                    keyboardType="numeric"
                    maxLength={11}
                  />
                  <Text style={s.fieldLabel}>Razón social</Text>
                  <TextInput
                    style={s.input}
                    placeholder="EMPRESA S.A.C."
                    placeholderTextColor={Colors.textMuted}
                    value={razon}
                    onChangeText={setRazon}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              <TouchableOpacity
                style={[s.generarBtn, (generando || (tipoComp === 'factura' && (!ruc || !razon))) && s.generarBtnDisabled]}
                onPress={handleGenerar}
                disabled={generando || (tipoComp === 'factura' && (!ruc || !razon))}
              >
                {generando ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={s.generarBtnTxt}>
                    {`Generar ${tipoComp === 'boleta' ? 'boleta' : 'factura'}`}
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={s.aviso}>
                📌 El comprobante quedará registrado en tu historial de cargas
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: Colors.navy },
  titulo: { fontSize: 22, fontWeight: '800', color: Colors.white },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  scroll: { flex: 1 },
  loadingBox: { paddingTop: 60, alignItems: 'center', gap: 12 },
  loadingTxt: { fontSize: 14, color: Colors.textMuted },
  emptyBox: { margin: 24, padding: 24, backgroundColor: Colors.white, borderRadius: 14, alignItems: 'center' },
  emptyTxt: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptySubTxt: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  cargaCard: { backgroundColor: Colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cargaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cargaFecha: { fontSize: 12, color: Colors.textMuted },
  cargaGrifo: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  cargaMonto: { fontSize: 18, fontWeight: '900', color: Colors.orange },
  cargaBot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cargaDetalle: { fontSize: 13, color: Colors.textSecondary },
  compBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  compBadgeTxt: { fontSize: 11, color: Colors.green, fontWeight: '700' },
  pendienteBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pendienteBadgeTxt: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  resumenCarga: { backgroundColor: Colors.white, margin: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  volverLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  volverLinkTxt: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
  resumenTitulo: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  resumenFecha: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  resumenMonto: { fontSize: 26, fontWeight: '900', color: Colors.orange, marginTop: 6 },
  formSection: { backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  formTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  tipoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tipoBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  tipoBtnActivo: { borderColor: Colors.orange, backgroundColor: '#FFF7EE' },
  tipoTxt: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  tipoTxtActivo: { color: Colors.orange },
  facturaFields: { gap: 8, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, backgroundColor: Colors.surface },
  generarBtn: { backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  generarBtnDisabled: { backgroundColor: Colors.border },
  generarBtnTxt: { fontSize: 15, fontWeight: '800', color: Colors.white },
  aviso: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 17 },
  exito: { margin: 20, backgroundColor: Colors.white, borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  exitoIco: { marginBottom: 12 },
  exitoTitulo: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  exitoNum: { fontSize: 18, fontWeight: '700', color: Colors.orange, marginBottom: 12 },
  exitoDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  exitoDetalle: { backgroundColor: Colors.surface, borderRadius: 10, padding: 14, width: '100%', gap: 6, marginBottom: 16 },
  exitoDetalleRow: { fontSize: 13, color: Colors.textSecondary },
  volverBtn: { paddingVertical: 10 },
  volverBtnTxt: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
});

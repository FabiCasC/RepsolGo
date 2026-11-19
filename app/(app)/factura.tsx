import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

const CARGAS_MOCK = [
  { id: '1', fecha: '18 Nov 2026', grifo: 'Grifo Miraflores Centro', tipo: '95 Oct', litros: 32.5, monto: 182.00, comprobante: null },
  { id: '2', fecha: '05 Nov 2026', grifo: 'Grifo San Isidro Norte', tipo: '90 Oct', litros: 28.0, monto: 148.40, comprobante: 'B001-00234' },
  { id: '3', fecha: '22 Oct 2026', grifo: 'Grifo Surco Principal', tipo: '95 Oct', litros: 40.0, monto: 224.00, comprobante: 'F001-00089' },
];

type TipoComprobante = 'boleta' | 'factura';

export default function FacturaScreen() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [tipoComp, setTipoComp] = useState<TipoComprobante>('boleta');
  const [ruc, setRuc] = useState('');
  const [razon, setRazon] = useState('');
  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState<string | null>(null);

  function handleGenerar() {
    if (tipoComp === 'factura' && (!ruc || !razon)) return;
    setGenerando(true);
    setTimeout(() => {
      setGenerando(false);
      setGenerado(tipoComp === 'boleta' ? 'B001-' + Math.floor(10000 + Math.random() * 90000) : 'F001-' + Math.floor(10000 + Math.random() * 90000));
    }, 1500);
  }

  const cargaActual = CARGAS_MOCK.find(c => c.id === seleccionada);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.titulo}>Comprobante Electrónico</Text>
        <Text style={s.subtitulo}>Genera tu boleta o factura por cada carga</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!seleccionada ? (
          <>
            <Text style={s.sectionLabel}>Selecciona una carga</Text>
            {CARGAS_MOCK.map(c => (
              <TouchableOpacity key={c.id} style={s.cargaCard} onPress={() => { setSeleccionada(c.id); setGenerado(null); }}>
                <View style={s.cargaTop}>
                  <View>
                    <Text style={s.cargaFecha}>{c.fecha}</Text>
                    <Text style={s.cargaGrifo}>{c.grifo}</Text>
                  </View>
                  <Text style={s.cargaMonto}>S/ {c.monto.toFixed(2)}</Text>
                </View>
                <View style={s.cargaBot}>
                  <Text style={s.cargaDetalle}>{c.litros} L · {c.tipo}</Text>
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
              Se ha enviado a tu correo en PDF.{'\n'}También puedes descargarlo desde aquí.
            </Text>
            <View style={s.exitoDetalle}>
              <Text style={s.exitoDetalleRow}>📍 {cargaActual?.grifo}</Text>
              <Text style={s.exitoDetalleRow}>📅 {cargaActual?.fecha}</Text>
              <Text style={s.exitoDetalleRow}>⛽ {cargaActual?.litros} L · {cargaActual?.tipo}</Text>
              <Text style={s.exitoDetalleRow}>💰 S/ {cargaActual?.monto.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={s.descargaBtn}>
              <Text style={s.descargaBtnTxt}>⬇️ Descargar PDF</Text>
            </TouchableOpacity>
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
              <Text style={s.resumenTitulo}>{cargaActual?.grifo}</Text>
              <Text style={s.resumenFecha}>{cargaActual?.fecha} · {cargaActual?.litros} L · {cargaActual?.tipo}</Text>
              <Text style={s.resumenMonto}>S/ {cargaActual?.monto.toFixed(2)}</Text>
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
                <Text style={s.generarBtnTxt}>
                  {generando ? 'Generando...' : `Generar ${tipoComp === 'boleta' ? 'boleta' : 'factura'}`}
                </Text>
              </TouchableOpacity>

              <Text style={s.aviso}>
                📧 El comprobante será enviado a tu correo registrado en formato PDF
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
  descargaBtn: { backgroundColor: Colors.navy, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginBottom: 10 },
  descargaBtnTxt: { fontSize: 14, fontWeight: '700', color: Colors.white },
  volverBtn: { paddingVertical: 10 },
  volverBtnTxt: { fontSize: 13, color: Colors.orange, fontWeight: '600' },
});

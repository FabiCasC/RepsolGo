import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

type Estado = 'inicio' | 'camara' | 'procesando' | 'resultado' | 'exito';

const OCR_MOCK = {
  grifo: 'Grifo Miraflores Centro',
  ruc: '20543041888',
  fecha: '12 Oct 2026',
  monto: 165.50,
  boleta: 'B001-00128',
  puntos: 827,
};

export default function OCRBoletaScreen() {
  const [estado, setEstado] = useState<Estado>('inicio');
  const [permission, requestPermission] = useCameraPermissions();
  const [resultado, setResultado] = useState<typeof OCR_MOCK | null>(null);
  const [ya_reclamada] = useState(false);

  async function abrirCamara() {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permiso necesario', 'Necesitamos acceso a la cámara para escanear tu boleta.');
        return;
      }
    }
    setEstado('camara');
  }

  async function seleccionarGaleria() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) procesarImagen();
  }

  function capturar() {
    procesarImagen();
  }

  function procesarImagen() {
    setEstado('procesando');
    setTimeout(() => {
      setResultado(OCR_MOCK);
      setEstado('resultado');
    }, 2000);
  }

  function acreditar() {
    setEstado('exito');
  }

  if (estado === 'camara' && permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView style={{ flex: 1 }}>
          <View style={s.camaraOverlay}>
            <Text style={s.camaraInstuccion}>Enfoca tu boleta Repsol</Text>
            <View style={s.camaraFrame}>
              <View style={[s.esquina, s.esquinaTL]} />
              <View style={[s.esquina, s.esquinaTR]} />
              <View style={[s.esquina, s.esquinaBL]} />
              <View style={[s.esquina, s.esquinaBR]} />
            </View>
            <Text style={s.camaraHint}>Asegúrate de que el RUC y monto sean visibles</Text>
            <TouchableOpacity style={s.capturarBtn} onPress={capturar}>
              <View style={s.capturarBtnInner} />
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelarBtn} onPress={() => setEstado('inicio')}>
              <Text style={s.cancelarBtnTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.titulo}>OCR Boleta</Text>
        <Text style={s.subtitulo}>Reclama puntos por cargas anteriores</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {estado === 'inicio' && (
          <>
            <View style={s.infoCard}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={s.infoIco}><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round"/><Polyline points="14,2 14,8 20,8" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round"/><Path d="M9 15h6M9 11h4" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/></Svg>
              <View style={s.infoTextos}>
                <Text style={s.infoTitulo}>¿Tienes boletas antiguas?</Text>
                <Text style={s.infoDesc}>
                  Si cargaste combustible antes de tener la app, puedes reclamar tus puntos fotografiando la boleta física.
                </Text>
              </View>
            </View>

            <View style={s.pasos}>
              <Text style={s.pasosTitulo}>¿Cómo funciona?</Text>
              {[
                { n: '1', txt: 'Fotografía tu boleta Repsol original' },
                { n: '2', txt: 'El OCR lee el monto, fecha y número de boleta' },
                { n: '3', txt: 'Se valida que no haya sido reclamada antes' },
                { n: '4', txt: 'Los puntos se acreditan automáticamente' },
              ].map(p => (
                <View key={p.n} style={s.paso}>
                  <View style={s.pasoNum}><Text style={s.pasoNumTxt}>{p.n}</Text></View>
                  <Text style={s.pasoTxt}>{p.txt}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={s.btnPrimario} onPress={abrirCamara}>
              <Text style={s.btnPrimarioTxt}>Fotografiar boleta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnSecundario} onPress={seleccionarGaleria}>
              <Text style={s.btnSecundarioTxt}>Seleccionar de galería</Text>
            </TouchableOpacity>
          </>
        )}

        {estado === 'procesando' && (
          <View style={s.procesando}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={s.procesandoIco}><Circle cx="11" cy="11" r="8" stroke={Colors.orange} strokeWidth={1.8}/><Path d="M21 21l-4.35-4.35" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/></Svg>
            <Text style={s.procesandoTitulo}>Procesando boleta...</Text>
            <Text style={s.procesandoDesc}>El OCR está leyendo el monto, fecha y número de boleta</Text>
          </View>
        )}

        {estado === 'resultado' && resultado && (
          <>
            <View style={s.resultCard}>
              <Text style={s.resultTitulo}>Boleta detectada</Text>
              <View style={s.resultRow}><Text style={s.resultLabel}>Grifo</Text><Text style={s.resultVal}>{resultado.grifo}</Text></View>
              <View style={s.resultRow}><Text style={s.resultLabel}>RUC</Text><Text style={s.resultVal}>{resultado.ruc}</Text></View>
              <View style={s.resultRow}><Text style={s.resultLabel}>Fecha</Text><Text style={s.resultVal}>{resultado.fecha}</Text></View>
              <View style={s.resultRow}><Text style={s.resultLabel}>N° Boleta</Text><Text style={s.resultVal}>{resultado.boleta}</Text></View>
              <View style={[s.resultRow, s.resultRowDestacado]}>
                <Text style={s.resultLabel}>Monto</Text>
                <Text style={s.resultMonto}>S/ {resultado.monto.toFixed(2)}</Text>
              </View>
            </View>

            <View style={s.puntosPreview}>
              <Text style={s.puntosPreviewLabel}>Puntos a acreditar</Text>
              <Text style={s.puntosPreviewNum}>+{resultado.puntos} pts</Text>
            </View>

            <TouchableOpacity style={s.btnPrimario} onPress={acreditar}>
              <Text style={s.btnPrimarioTxt}>Acreditar puntos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnSecundario} onPress={() => setEstado('inicio')}>
              <Text style={s.btnSecundarioTxt}>Intentar con otra boleta</Text>
            </TouchableOpacity>
          </>
        )}

        {estado === 'exito' && resultado && (
          <View style={s.exitoCard}>
            <Svg width={56} height={56} viewBox="0 0 24 24" fill="none" style={s.exitoIco}><Circle cx="12" cy="12" r="10" stroke={Colors.green} strokeWidth={2}/><Polyline points="9,12 11,14 15,10" stroke={Colors.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/></Svg>
            <Text style={s.exitoTitulo}>¡Puntos acreditados!</Text>
            <Text style={s.exitoPuntos}>+{resultado.puntos} puntos</Text>
            <Text style={s.exitoDesc}>
              Los puntos de tu boleta {resultado.boleta} han sido acreditados correctamente.
            </Text>
            <TouchableOpacity style={s.btnPrimario} onPress={() => setEstado('inicio')}>
              <Text style={s.btnPrimarioTxt}>Reclamar otra boleta</Text>
            </TouchableOpacity>
          </View>
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
  scroll: { flex: 1, padding: 16 },
  infoCard: { flexDirection: 'row', backgroundColor: '#FFF7EE', borderRadius: 14, padding: 14, gap: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA' },
  infoIco: { fontSize: 32 },
  infoTextos: { flex: 1 },
  infoTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  infoDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  pasos: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  pasosTitulo: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  paso: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pasoNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center' },
  pasoNumTxt: { fontSize: 13, fontWeight: '800', color: Colors.white },
  pasoTxt: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  btnPrimario: { backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnPrimarioTxt: { fontSize: 15, fontWeight: '800', color: Colors.white },
  btnSecundario: { backgroundColor: Colors.white, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  btnSecundarioTxt: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  procesando: { alignItems: 'center', paddingVertical: 60 },
  procesandoIco: { fontSize: 56, marginBottom: 16 },
  procesandoTitulo: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  procesandoDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  resultCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  resultTitulo: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultRowDestacado: { borderBottomWidth: 0, paddingTop: 12 },
  resultLabel: { fontSize: 13, color: Colors.textMuted },
  resultVal: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  resultMonto: { fontSize: 20, fontWeight: '900', color: Colors.orange },
  puntosPreview: { backgroundColor: '#FFF7EE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#FED7AA' },
  puntosPreviewLabel: { fontSize: 13, color: Colors.textMuted },
  puntosPreviewNum: { fontSize: 32, fontWeight: '900', color: Colors.orange, marginTop: 4 },
  exitoCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  exitoIco: { fontSize: 56, marginBottom: 12 },
  exitoTitulo: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  exitoPuntos: { fontSize: 32, fontWeight: '900', color: Colors.orange, marginBottom: 12 },
  exitoDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  camaraOverlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  camaraInstuccion: { fontSize: 16, fontWeight: '700', color: Colors.white, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  camaraFrame: { width: 280, height: 180, position: 'relative' },
  esquina: { position: 'absolute', width: 28, height: 28, borderColor: Colors.orange, borderWidth: 3 },
  esquinaTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  esquinaTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  esquinaBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  esquinaBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  camaraHint: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: 24 },
  capturarBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  capturarBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.white },
  cancelarBtn: { paddingVertical: 10, paddingHorizontal: 24 },
  cancelarBtnTxt: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
});

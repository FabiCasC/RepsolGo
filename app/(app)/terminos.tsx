import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

function IcoBack() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={Colors.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const SECCIONES = [
  {
    titulo: '1. Aceptación de los términos',
    contenido: 'Al descargar, instalar o utilizar la aplicación RepsolGo, usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de los términos, no utilice la aplicación.',
  },
  {
    titulo: '2. Descripción del servicio',
    contenido: 'RepsolGo es una aplicación móvil de fidelización que permite a los clientes de Repsol Perú acumular y canjear puntos, registrar cargas de combustible, reportar incidencias y acceder a beneficios exclusivos.',
  },
  {
    titulo: '3. Registro y cuenta de usuario',
    contenido: 'Para utilizar las funciones completas de RepsolGo debe crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades realizadas bajo su cuenta.',
  },
  {
    titulo: '4. Programa de puntos',
    contenido: 'Los puntos acumulados en RepsolGo no tienen valor monetario y solo pueden canjearse por los beneficios disponibles en la aplicación. Los puntos caducan a los 12 meses desde su acumulación. Repsol se reserva el derecho de modificar las condiciones del programa.',
  },
  {
    titulo: '5. Uso adecuado',
    contenido: 'El usuario se compromete a utilizar RepsolGo únicamente para los fines legítimos para los que fue diseñada. Está prohibido el uso fraudulento, la manipulación de puntos o cualquier actividad que atente contra la integridad del sistema.',
  },
  {
    titulo: '6. Privacidad de datos',
    contenido: 'Repsol Perú recopila y procesa sus datos personales conforme a su Política de Privacidad. Al usar RepsolGo usted consiente el tratamiento de sus datos para los fines descritos en dicha política.',
  },
  {
    titulo: '7. Modificaciones',
    contenido: 'Repsol se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la aplicación. El uso continuo de RepsolGo tras las modificaciones implica aceptación de los nuevos términos.',
  },
  {
    titulo: '8. Limitación de responsabilidad',
    contenido: 'RepsolGo se proporciona "tal como está". Repsol no garantiza que la aplicación esté libre de errores o interrupciones. En ningún caso Repsol será responsable de daños indirectos, incidentales o consecuentes derivados del uso de la aplicación.',
  },
  {
    titulo: '9. Ley aplicable',
    contenido: 'Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de Lima, Perú.',
  },
  {
    titulo: '10. Contacto',
    contenido: 'Para consultas sobre estos Términos y Condiciones, puede comunicarse con nosotros a través del correo legal@repsol.com.pe o llamando al número 0800-00888.',
  },
];

export default function TerminosScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack />
        </TouchableOpacity>
        <Text style={s.titulo}>Términos y condiciones</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.fechaBox}>
          <Text style={s.fechaTxt}>Última actualización: 1 de enero de 2026</Text>
        </View>
        <Text style={s.intro}>
          Estos Términos y Condiciones regulan el uso de RepsolGo, aplicación móvil de Repsol Comercial S.A.C. (Repsol Perú). Léalos cuidadosamente antes de utilizar el servicio.
        </Text>

        {SECCIONES.map((sec, i) => (
          <View key={i} style={s.seccion}>
            <Text style={s.secTitulo}>{sec.titulo}</Text>
            <Text style={s.secContenido}>{sec.contenido}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.footerTxt}>Repsol Comercial S.A.C. · Lima, Perú · Todos los derechos reservados</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 17, fontWeight: '700', color: Colors.navy, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

  fechaBox: { backgroundColor: Colors.surface, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  fechaTxt: { fontSize: 12, color: Colors.textMuted },

  intro: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },

  seccion: { marginBottom: 20 },
  secTitulo: { fontSize: 14, fontWeight: '700', color: Colors.navy, marginBottom: 8 },
  secContenido: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },

  footer: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center' },
  footerTxt: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

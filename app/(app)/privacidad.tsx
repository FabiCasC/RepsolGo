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
    titulo: '1. Responsable del tratamiento',
    contenido: 'Repsol Comercial S.A.C., con RUC 20506598223 y domicilio en Av. República de Panamá 3461, San Isidro, Lima, Perú, es el responsable del tratamiento de sus datos personales en la aplicación RepsolGo.',
  },
  {
    titulo: '2. Datos que recopilamos',
    contenido: 'Recopilamos los siguientes tipos de datos: (a) Datos de registro: nombre, correo electrónico, número de teléfono y contraseña. (b) Datos de uso: historial de cargas de combustible, puntos acumulados, grifos visitados. (c) Datos de dispositivo: modelo del dispositivo, versión del sistema operativo y datos de uso de la app. (d) Datos de ubicación: solo cuando otorga permiso explícito, para mostrar grifos cercanos.',
  },
  {
    titulo: '3. Finalidad del tratamiento',
    contenido: 'Tratamos sus datos para: gestionar su cuenta y el programa de puntos; brindarle los servicios de RepsolGo; enviarle comunicaciones sobre beneficios, ofertas y novedades (con su consentimiento); mejorar nuestros servicios mediante análisis estadístico; y cumplir obligaciones legales.',
  },
  {
    titulo: '4. Base legal',
    contenido: 'El tratamiento de sus datos se basa en: la ejecución del contrato de uso de RepsolGo; su consentimiento expreso para comunicaciones de marketing y uso de ubicación; y nuestros intereses legítimos para el funcionamiento y mejora del servicio.',
  },
  {
    titulo: '5. Compartición de datos',
    contenido: 'No vendemos sus datos personales a terceros. Podemos compartir datos con: proveedores de servicios tecnológicos (Firebase/Google) que actúan como encargados del tratamiento bajo acuerdos de confidencialidad; y autoridades cuando sea requerido por ley.',
  },
  {
    titulo: '6. Transferencia internacional',
    contenido: 'Sus datos pueden ser transferidos a servidores ubicados fuera del Perú (principalmente EE.UU.) a través de Google Firebase. Estas transferencias se realizan bajo las garantías adecuadas establecidas por la normativa peruana de protección de datos.',
  },
  {
    titulo: '7. Conservación de datos',
    contenido: 'Conservamos sus datos mientras su cuenta esté activa. Si elimina su cuenta, sus datos serán eliminados en un plazo máximo de 90 días, salvo que la ley exija conservarlos por más tiempo.',
  },
  {
    titulo: '8. Sus derechos',
    contenido: 'Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales), usted tiene derecho a: acceder a sus datos, rectificarlos, cancelarlos, oponerse a su tratamiento y solicitar su portabilidad. Para ejercer estos derechos, escríbanos a privacidad@repsol.com.pe.',
  },
  {
    titulo: '9. Seguridad',
    contenido: 'Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos contra acceso no autorizado, pérdida o destrucción, incluyendo cifrado en tránsito (HTTPS) y en reposo, y autenticación segura mediante Firebase Auth.',
  },
  {
    titulo: '10. Cookies y tecnologías similares',
    contenido: 'RepsolGo no utiliza cookies de rastreo publicitario. Utilizamos almacenamiento local del dispositivo únicamente para mantener su sesión activa y personalizar la experiencia dentro de la app.',
  },
  {
    titulo: '11. Cambios en esta política',
    contenido: 'Podemos actualizar esta Política de Privacidad. Le notificaremos los cambios significativos a través de la aplicación. El uso continuado de RepsolGo tras los cambios implica su aceptación.',
  },
  {
    titulo: '12. Contacto',
    contenido: 'Para cualquier consulta sobre privacidad, contáctenos en privacidad@repsol.com.pe o llame al 0800-00888. También puede acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia del Perú.',
  },
];

export default function PrivacidadScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack />
        </TouchableOpacity>
        <Text style={s.titulo}>Política de privacidad</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.fechaBox}>
          <Text style={s.fechaTxt}>Última actualización: 1 de enero de 2026</Text>
        </View>
        <View style={s.introCard}>
          <Text style={s.introTitle}>Tu privacidad importa</Text>
          <Text style={s.introTxt}>
            En Repsol Perú nos comprometemos a proteger tus datos personales. Esta política explica qué recopilamos, cómo lo usamos y cuáles son tus derechos según la Ley N° 29733.
          </Text>
        </View>

        {SECCIONES.map((sec, i) => (
          <View key={i} style={s.seccion}>
            <Text style={s.secTitulo}>{sec.titulo}</Text>
            <Text style={s.secContenido}>{sec.contenido}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.footerTxt}>Repsol Comercial S.A.C. · Lima, Perú</Text>
          <Text style={s.footerTxt}>Ley N° 29733 — Ley de Protección de Datos Personales</Text>
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

  introCard: { backgroundColor: Colors.navy, borderRadius: 14, padding: 18, marginBottom: 24 },
  introTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  introTxt: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },

  seccion: { marginBottom: 20 },
  secTitulo: { fontSize: 14, fontWeight: '700', color: Colors.navy, marginBottom: 8 },
  secContenido: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },

  footer: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center', gap: 4 },
  footerTxt: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
});

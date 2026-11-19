import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';

function IcoBack() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={Colors.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IcoPhone() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoMail() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke={Colors.orange} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoChevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const FAQS = [
  { pregunta: '¿Cómo acumulo puntos?', respuesta: 'Acumulas puntos cada vez que cargas combustible en un grifo Repsol. También puedes ganar puntos completando retos, referidos y usando el escáner de boletas.' },
  { pregunta: '¿Cómo canjeo mis puntos?', respuesta: 'Ve a la sección "Canjear puntos" en tu perfil. Podrás cambiar tus puntos por descuentos en combustible, productos en tienda Repsol, lavados de auto y más.' },
  { pregunta: '¿Qué es el Escáner de Boletas?', respuesta: 'Es una función que te permite fotografiar tus boletas físicas de Repsol para acreditar puntos automáticamente. Útil si olvidaste presentar tu app al momento de la carga.' },
  { pregunta: '¿Cómo funciona la Huella de Carbono?', respuesta: 'Calculamos tus emisiones de CO₂ en base a tus cargas registradas. Puedes compensar tu huella canjeando puntos por acciones ecológicas como plantar árboles.' },
  { pregunta: '¿Puedo tener una cuenta grupal?', respuesta: 'Sí. La cuenta grupal permite agrupar vehículos de empresa o familia. Los puntos de todas las cargas se suman en un solo saldo compartido.' },
  { pregunta: '¿Qué hago si no recibo mis puntos?', respuesta: 'Espera hasta 24 horas para que los puntos se acrediten. Si pasado ese tiempo no aparecen, usa el Escáner de Boletas o comunícate con nuestro soporte.' },
];

export default function AyudaScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <IcoBack />
        </TouchableOpacity>
        <Text style={s.titulo}>Ayuda y soporte</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Contacto */}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>¿Necesitas ayuda directa?</Text>
          <Text style={s.contactSub}>Nuestro equipo está disponible de lunes a sábado de 8am a 8pm.</Text>
          <View style={s.contactBtns}>
            <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('tel:080000888')}>
              <IcoPhone />
              <Text style={s.contactBtnTxt}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('mailto:atencion@repsol.com.pe')}>
              <IcoMail />
              <Text style={s.contactBtnTxt}>Escribir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={s.sectionLabel}>Preguntas frecuentes</Text>
        {FAQS.map((faq, i) => (
          <FAQItem key={i} pregunta={faq.pregunta} respuesta={faq.respuesta} />
        ))}

        <View style={s.versionBox}>
          <Text style={s.versionTxt}>RepsolGo v1.0.0 · Repsol Perú</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FAQItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TouchableOpacity style={s.faqCard} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
      <View style={s.faqHeader}>
        <Text style={s.faqQ}>{pregunta}</Text>
        <View style={[s.chevron, open && s.chevronOpen]}>
          <IcoChevron />
        </View>
      </View>
      {open && <Text style={s.faqA}>{respuesta}</Text>}
    </TouchableOpacity>
  );
}

import React from 'react';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 17, fontWeight: '700', color: Colors.navy },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  contactCard: { backgroundColor: Colors.navy, borderRadius: 16, padding: 20, marginBottom: 24 },
  contactTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  contactSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 18 },
  contactBtns: { flexDirection: 'row', gap: 12 },
  contactBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  contactBtnTxt: { fontSize: 14, fontWeight: '600', color: '#fff' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  faqCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { fontSize: 14, fontWeight: '600', color: Colors.navy, flex: 1, paddingRight: 12 },
  chevron: { },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  faqA: { fontSize: 13, color: Colors.textSecondary, marginTop: 10, lineHeight: 20 },

  versionBox: { alignItems: 'center', marginTop: 24 },
  versionTxt: { fontSize: 12, color: Colors.textMuted },
});

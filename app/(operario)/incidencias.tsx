import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Colors } from '../../src/constants/colors'
import { Button } from '../../src/components/ui/Button'
import { FirestoreService } from '../../src/services/firestore.service'
import { useAuthStore } from '../../src/store/auth.store'
import { Timestamp } from '@firebase/firestore'

type Categoria = 'derrame' | 'falla_surtidor' | 'accidente' | 'otro'

const CATEGORIAS: { id: Categoria; label: string; icon: string; color: string }[] = [
  { id: 'derrame', label: 'Derrame', icon: '🛢️', color: '#EF4444' },
  { id: 'falla_surtidor', label: 'Falla de surtidor', icon: '⛽', color: '#F97316' },
  { id: 'accidente', label: 'Accidente', icon: '🚨', color: '#8B5CF6' },
  { id: 'otro', label: 'Otro', icon: '📋', color: '#6B7280' },
]

interface Incidencia {
  id: string
  categoria: string
  descripcion: string
  timestamp: Timestamp
}

export default function IncidenciasScreen() {
  const user = useAuthStore(s => s.user)
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [fotoUri, setFotoUri] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'form' | 'list'>('form')

  const loadIncidencias = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await FirestoreService.getIncidenciasByOperario(user.id)
      setIncidencias(data as Incidencia[])
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadIncidencias()
  }, [loadIncidencias])

  async function handleTomarFoto() {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!result.granted) {
      const cam = await ImagePicker.requestCameraPermissionsAsync()
      if (!cam.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotos.')
        return
      }
    }
    Alert.alert('Agregar foto', '¿Cómo deseas agregar la foto?', [
      {
        text: 'Cámara',
        onPress: async () => {
          const r = await ImagePicker.launchCameraAsync({ quality: 0.6 })
          if (!r.canceled) setFotoUri(r.assets[0].uri)
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 })
          if (!r.canceled) setFotoUri(r.assets[0].uri)
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  async function handleSubmit() {
    if (!categoria) {
      Alert.alert('Categoría requerida', 'Selecciona una categoría.')
      return
    }
    if (!descripcion.trim()) {
      Alert.alert('Descripción requerida', 'Describe brevemente la incidencia.')
      return
    }
    if (!user?.id) return
    setSubmitting(true)
    try {
      await FirestoreService.guardarIncidencia({
        categoria,
        descripcion: descripcion.trim(),
        fotoUri: fotoUri ?? undefined,
        grifoId: 'grifo_javier_prado',
        operarioId: user.id,
      })
      Alert.alert('¡Incidencia registrada!', 'Se guardó correctamente.', [
        {
          text: 'OK',
          onPress: () => {
            setCategoria(null)
            setDescripcion('')
            setFotoUri(null)
            loadIncidencias()
            setMode('list')
          },
        },
      ])
    } catch {
      Alert.alert('Error', 'No se pudo guardar la incidencia.')
    } finally {
      setSubmitting(false)
    }
  }

  function formatTs(ts: Timestamp) {
    if (!ts?.toDate) return '—'
    return ts.toDate().toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function getCatInfo(id: string) {
    return CATEGORIAS.find(c => c.id === id) ?? CATEGORIAS[3]
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incidencias</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'form' && styles.tabActive]}
            onPress={() => setMode('form')}
          >
            <Text style={[styles.tabText, mode === 'form' && styles.tabTextActive]}>Nueva</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'list' && styles.tabActive]}
            onPress={() => setMode('list')}
          >
            <Text style={[styles.tabText, mode === 'list' && styles.tabTextActive]}>Historial ({incidencias.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'form' ? (
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.catGrid}>
              {CATEGORIAS.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, categoria === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
                  onPress={() => setCategoria(cat.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, categoria === cat.id && { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={styles.textarea}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe brevemente lo ocurrido..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text style={styles.charCount}>{descripcion.length}/300</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Foto (opcional)</Text>
            {fotoUri ? (
              <View style={styles.fotoContainer}>
                <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
                <TouchableOpacity onPress={() => setFotoUri(null)} style={styles.fotoRemove}>
                  <Text style={styles.fotoRemoveText}>✕ Quitar foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.fotoBtn} onPress={handleTomarFoto} activeOpacity={0.85}>
                <Text style={styles.fotoBtnIcon}>📷</Text>
                <Text style={styles.fotoBtnText}>Agregar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.submitSection}>
            <Button
              label={submitting ? 'Guardando...' : 'Registrar incidencia'}
              onPress={handleSubmit}
              fullWidth
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.orange} />
            </View>
          ) : incidencias.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin incidencias</Text>
              <Text style={styles.emptyDesc}>No has registrado incidencias aún.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {incidencias.map(inc => {
                const cat = getCatInfo(inc.categoria)
                return (
                  <View key={inc.id} style={styles.incCard}>
                    <View style={[styles.incIconBox, { backgroundColor: cat.color + '20' }]}>
                      <Text style={styles.incIcon}>{cat.icon}</Text>
                    </View>
                    <View style={styles.incInfo}>
                      <Text style={[styles.incCat, { color: cat.color }]}>{cat.label}</Text>
                      <Text style={styles.incDesc} numberOfLines={2}>{inc.descripcion}</Text>
                      <Text style={styles.incTs}>{formatTs(inc.timestamp)}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 14 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: Colors.orange },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    padding: 14, alignItems: 'center', backgroundColor: Colors.white,
  },
  catIcon: { fontSize: 28, marginBottom: 8 },
  catLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  textarea: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    padding: 14, fontSize: 14, color: Colors.textPrimary,
    backgroundColor: Colors.white, minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
  fotoContainer: { alignItems: 'center' },
  fotoPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  fotoRemove: { backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  fotoRemoveText: { color: Colors.red, fontWeight: '600', fontSize: 13 },
  fotoBtn: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', backgroundColor: Colors.white,
  },
  fotoBtnIcon: { fontSize: 36, marginBottom: 8 },
  fotoBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  submitSection: { padding: 20, paddingTop: 24 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  listContainer: { padding: 16, gap: 10 },
  incCard: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: Colors.border,
  },
  incIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  incIcon: { fontSize: 22 },
  incInfo: { flex: 1 },
  incCat: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  incDesc: { fontSize: 13, color: Colors.textPrimary, marginBottom: 4 },
  incTs: { fontSize: 11, color: Colors.textMuted },
})

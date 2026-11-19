import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { Colors } from '../../../src/constants/colors'
import { Button } from '../../../src/components/ui/Button'
import { FirestoreService } from '../../../src/services/firestore.service'
import { useAuthStore } from '../../../src/store/auth.store'

interface GrupoPlaca {
  placa: string
  alias?: string
}

interface Grupo {
  id: string
  nombre: string
  tipo: 'familiar' | 'empresa'
  puntosPool: number
  placas: GrupoPlaca[]
  titularNombre: string
}

export default function CuentaGrupalScreen() {
  const user = useAuthStore(s => s.user)
  const [loading, setLoading] = useState(true)
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [grupoId, setGrupoId] = useState<string | null>(null)

  // Create form
  const [mode, setMode] = useState<'view' | 'create' | 'addPlaca'>('view')
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [tipoGrupo, setTipoGrupo] = useState<'familiar' | 'empresa'>('familiar')
  const [creating, setCreating] = useState(false)

  // Add placa form
  const [nuevaPlaca, setNuevaPlaca] = useState('')
  const [aliasPlaca, setAliasPlaca] = useState('')
  const [addingPlaca, setAddingPlaca] = useState(false)

  async function loadGrupo() {
    if (!user?.id) return
    try {
      const id = await FirestoreService.getGrupoByUser(user.id)
      if (id) {
        setGrupoId(id)
        const data = await FirestoreService.getGrupo(id)
        setGrupo(data as Grupo | null)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadGrupo()
  }, [user?.id])

  async function handleCrearGrupo() {
    if (!nombreGrupo.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa un nombre para el grupo.')
      return
    }
    if (!user?.id) return
    setCreating(true)
    try {
      const id = await FirestoreService.crearGrupo({
        nombre: nombreGrupo.trim(),
        tipo: tipoGrupo,
        titularUid: user.id,
        titularNombre: user.nombre ?? 'Titular',
      })
      setGrupoId(id)
      const data = await FirestoreService.getGrupo(id)
      setGrupo(data as Grupo | null)
      setMode('view')
      Alert.alert('¡Grupo creado!', `El grupo "${nombreGrupo}" fue creado exitosamente.`)
    } catch {
      Alert.alert('Error', 'No se pudo crear el grupo.')
    } finally {
      setCreating(false)
    }
  }

  async function handleAgregarPlaca() {
    const placa = nuevaPlaca.trim().toUpperCase()
    if (!placa) {
      Alert.alert('Placa requerida', 'Ingresa el número de placa.')
      return
    }
    if (!grupoId || !user?.id) return
    setAddingPlaca(true)
    try {
      await FirestoreService.agregarPlacaGrupo(
        grupoId,
        placa,
        aliasPlaca.trim() || placa,
        user.id,
        user.nombre ?? 'Miembro',
      )
      await loadGrupo()
      setNuevaPlaca('')
      setAliasPlaca('')
      setMode('view')
      Alert.alert('¡Placa agregada!', `La placa ${placa} fue agregada al grupo.`)
    } catch {
      Alert.alert('Error', 'No se pudo agregar la placa.')
    } finally {
      setAddingPlaca(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuenta Grupal</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuenta Grupal</Text>
        <Text style={styles.headerSub}>Pool de puntos compartidos</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        {!grupo && mode === 'view' && (
          <View style={styles.emptySection}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" style={styles.emptyIcon}><Circle cx="9" cy="7" r="3" stroke={Colors.textMuted} strokeWidth={1.8}/><Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/><Path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/></Svg>
            <Text style={styles.emptyTitle}>Sin cuenta grupal</Text>
            <Text style={styles.emptyDesc}>
              Crea una cuenta grupal o familiar para acumular puntos entre varios vehículos y canjearlos juntos.
            </Text>
            <Button
              label="Crear cuenta grupal"
              onPress={() => setMode('create')}
              fullWidth
              style={styles.createBtn}
            />
          </View>
        )}

        {!grupo && mode === 'create' && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Crear cuenta grupal</Text>

            <Text style={styles.inputLabel}>Nombre del grupo</Text>
            <TextInput
              style={styles.input}
              value={nombreGrupo}
              onChangeText={setNombreGrupo}
              placeholder="Ej: Familia García"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Tipo de grupo</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[styles.tipoBtn, tipoGrupo === 'familiar' && styles.tipoBtnActive]}
                onPress={() => setTipoGrupo('familiar')}
              >
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={styles.tipoIcon}><Circle cx="9" cy="7" r="3" stroke={Colors.navy} strokeWidth={1.8}/><Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={Colors.navy} strokeWidth={1.8} strokeLinecap="round"/><Path d="M16 3.13a4 4 0 010 7.75" stroke={Colors.navy} strokeWidth={1.8} strokeLinecap="round"/></Svg>
                <Text style={[styles.tipoLabel, tipoGrupo === 'familiar' && styles.tipoLabelActive]}>Familiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoBtn, tipoGrupo === 'empresa' && styles.tipoBtnActive]}
                onPress={() => setTipoGrupo('empresa')}
              >
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={styles.tipoIcon}><Rect x="2" y="3" width="20" height="18" rx="2" stroke={Colors.navy} strokeWidth={1.8}/><Path d="M8 21V10M16 21V10M12 21V10M2 10h20" stroke={Colors.navy} strokeWidth={1.8} strokeLinecap="round"/></Svg>
                <Text style={[styles.tipoLabel, tipoGrupo === 'empresa' && styles.tipoLabelActive]}>Empresa</Text>
              </TouchableOpacity>
            </View>

            <Button
              label={creating ? 'Creando...' : 'Crear grupo'}
              onPress={handleCrearGrupo}
              fullWidth
              style={styles.actionBtn}
            />
            <Button
              label="Cancelar"
              onPress={() => setMode('view')}
              variant="outline"
              fullWidth
            />
          </View>
        )}

        {grupo && (
          <>
            {/* Grupo card */}
            <View style={styles.grupoCard}>
              <View style={styles.grupoHeaderRow}>
                <View style={styles.grupoIconBox}>
                  <Text style={styles.grupoIcon}>' '</Text>
                </View>
                <View style={styles.grupoInfo}>
                  <Text style={styles.grupoNombre}>{grupo.nombre}</Text>
                  <View style={styles.tipoBadge}>
                    <Text style={styles.tipoBadgeText}>{grupo.tipo === 'familiar' ? 'Familiar' : 'Empresa'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.poolCard}>
                <Text style={styles.poolLabel}>Pool de puntos compartidos</Text>
                <Text style={styles.poolPuntos}>{grupo.puntosPool.toLocaleString('es-PE')}</Text>
                <Text style={styles.poolLblPts}>puntos disponibles</Text>
              </View>
            </View>

            {/* Placas */}
            <View style={styles.placasSection}>
              <View style={styles.placasHeader}>
                <Text style={styles.placasTitle}>Vehículos del grupo</Text>
                <TouchableOpacity
                  style={styles.addPlacaBtn}
                  onPress={() => setMode(mode === 'addPlaca' ? 'view' : 'addPlaca')}
                >
                  <Text style={styles.addPlacaBtnText}>{mode === 'addPlaca' ? '✕ Cancelar' : '+ Agregar'}</Text>
                </TouchableOpacity>
              </View>

              {mode === 'addPlaca' && (
                <View style={styles.addPlacaForm}>
                  <Text style={styles.inputLabel}>Número de placa *</Text>
                  <TextInput
                    style={styles.input}
                    value={nuevaPlaca}
                    onChangeText={t => setNuevaPlaca(t.toUpperCase())}
                    placeholder="Ej: ABC-123"
                    autoCapitalize="characters"
                    maxLength={8}
                    placeholderTextColor={Colors.textMuted}
                  />
                  <Text style={styles.inputLabel}>Alias del vehículo (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={aliasPlaca}
                    onChangeText={setAliasPlaca}
                    placeholder="Ej: Auto de mamá"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <Button
                    label={addingPlaca ? 'Agregando...' : 'Agregar vehículo'}
                    onPress={handleAgregarPlaca}
                    fullWidth
                    style={styles.actionBtn}
                  />
                </View>
              )}

              {grupo.placas.length === 0 ? (
                <View style={styles.noPlacas}>
                  <Text style={styles.noPlacasText}>Sin vehículos. Agrega la primera placa.</Text>
                </View>
              ) : (
                grupo.placas.map((p, i) => (
                  <View key={p.placa + i} style={styles.placaRow}>
                    <View style={styles.placaBadge}>
                      <Text style={styles.placaBadgeText}>{p.placa}</Text>
                    </View>
                    <Text style={styles.placaAlias}>{p.alias || p.placa}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptySection: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 48 },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  createBtn: { marginTop: 0 },
  formSection: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: Colors.textPrimary, backgroundColor: Colors.white,
  },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  tipoBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    padding: 16, alignItems: 'center', backgroundColor: Colors.white,
  },
  tipoBtnActive: { borderColor: Colors.orange, backgroundColor: '#FFF3E0' },
  tipoIcon: { fontSize: 28, marginBottom: 6 },
  tipoLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tipoLabelActive: { color: Colors.orange },
  actionBtn: { marginTop: 20, marginBottom: 12 },
  grupoCard: { margin: 16, backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: Colors.border },
  grupoHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  grupoIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  grupoIcon: { fontSize: 28 },
  grupoInfo: { flex: 1 },
  grupoNombre: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  tipoBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  tipoBadgeText: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
  poolCard: {
    backgroundColor: Colors.navy, borderRadius: 16, padding: 20, alignItems: 'center',
  },
  poolLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  poolPuntos: { fontSize: 48, fontWeight: '800', color: Colors.orange },
  poolLblPts: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  placasSection: { paddingHorizontal: 16, paddingBottom: 32 },
  placasHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  placasTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  addPlacaBtn: { backgroundColor: Colors.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addPlacaBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  addPlacaForm: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  noPlacas: { backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  noPlacasText: { fontSize: 14, color: Colors.textSecondary },
  placaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border,
  },
  placaBadge: { backgroundColor: Colors.navy, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 14 },
  placaBadgeText: { color: Colors.white, fontWeight: '800', fontSize: 14, letterSpacing: 2 },
  placaAlias: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
})

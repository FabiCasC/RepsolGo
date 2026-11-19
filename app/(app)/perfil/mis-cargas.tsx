import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Colors } from '../../../src/constants/colors'
import { useAuthStore } from '../../../src/store/auth.store'
import { FirestoreService, CargaData } from '../../../src/services/firestore.service'

type CargaItem = CargaData & { id: string }

function CargaRow({ carga }: { carga: CargaItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.icon}><Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/><Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 6h6M3 22h10" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round"/></Svg>
        </View>
        <View>
          <Text style={styles.grifoName}>{carga.grifoNombre}</Text>
          <Text style={styles.fecha}>{carga.fecha}</Text>
          <Text style={styles.detalle}>{carga.combustible} · {carga.litros} · {carga.monto}</Text>
        </View>
      </View>
      <Text style={styles.puntos}>+{carga.puntos} pts</Text>
    </View>
  )
}

export default function MisCargasScreen() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [cargas, setCargas] = useState<CargaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadCargas = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await FirestoreService.getCargas(user.id)
      setCargas(data)
    } catch {}
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadCargas()
  }, [loadCargas])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mis cargas</Text>
        <View style={{ width: 70 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <FlatList
          data={cargas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CargaRow carga={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadCargas() }}
              tintColor={Colors.orange}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={styles.emptyIcon}><Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/><Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 6h6M3 22h10" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round"/></Svg>
              <Text style={styles.emptyTitle}>Sin cargas aún</Text>
              <Text style={styles.emptyDesc}>Escanea tu primera boleta para empezar a ganar puntos.</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.navy,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '500',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  grifoName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fecha: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detalle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  puntos: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.orange,
  },
  separator: {
    height: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})

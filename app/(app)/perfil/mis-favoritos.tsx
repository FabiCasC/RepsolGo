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
import { Colors } from '../../../src/constants/colors'
import { useAuthStore } from '../../../src/store/auth.store'
import { GrifosService } from '../../../src/services/grifos.service'
import type { Grifo } from '../../../src/types'

function GrifoFavRow({ grifo, onRemove }: { grifo: Grifo; onRemove: (id: string) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⭐</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.grifoName}>{grifo.nombre}</Text>
          <Text style={styles.direccion}>{grifo.direccion}</Text>
          <Text style={styles.precio}>
            {grifo.precios[0] ? `${grifo.precios[0].tipo}: S/${grifo.precios[0].precio}` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onRemove(grifo.id)} style={styles.removeBtn}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function MisFavoritosScreen() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [favoritos, setFavoritos] = useState<Grifo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadFavoritos = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await GrifosService.getFavoritos(user.id)
      setFavoritos(data)
    } catch {}
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadFavoritos()
  }, [loadFavoritos])

  async function handleRemove(grifoId: string) {
    if (!user?.id) return
    const grifo = favoritos.find(g => g.id === grifoId)
    if (!grifo) return
    try {
      await GrifosService.toggleFavorito(user.id, grifo)
      setFavoritos(prev => prev.filter(g => g.id !== grifoId))
    } catch {}
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Mis favoritos</Text>
        <View style={{ width: 70 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <GrifoFavRow grifo={item} onRemove={handleRemove} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadFavoritos() }}
              tintColor={Colors.orange}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
              <Text style={styles.emptyDesc}>Guarda tus grifos Repsol favoritos desde el mapa.</Text>
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
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  rowInfo: {
    flex: 1,
  },
  grifoName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  direccion: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  precio: {
    fontSize: 12,
    color: Colors.orange,
    fontWeight: '600',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeText: {
    fontSize: 14,
    color: Colors.textMuted,
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

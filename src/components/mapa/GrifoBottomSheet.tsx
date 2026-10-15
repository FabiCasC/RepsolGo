import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Colors } from '../../constants/colors'
import type { Grifo } from '../../types'

interface GrifoBottomSheetProps {
  grifo: Grifo | null
  onClose: () => void
  onToggleFavorito: (id: string) => void
}

export function GrifoBottomSheet({ grifo, onClose, onToggleFavorito }: GrifoBottomSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (grifo) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [grifo, translateY])

  if (!grifo) return null

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nombre}>{grifo.nombre}</Text>
          <Text style={styles.direccion}>{grifo.direccion}</Text>
          <View style={styles.badges}>
            {grifo.abierto24h && (
              <View style={styles.badgeAbierto}>
                <View style={styles.dot} />
                <Text style={styles.badgeText}>Abierto 24h</Text>
              </View>
            )}
            <View style={styles.badgeDistancia}>
              <Text style={styles.badgeText}>{grifo.distancia}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => onToggleFavorito(grifo.id)} style={styles.starBtn}>
          <Text style={[styles.star, grifo.esFavorito && styles.starActive]}>
            {grifo.esFavorito ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.precios}>
        <Text style={styles.preciosTitle}>Precios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {grifo.precios.map(p => (
            <View key={p.tipo} style={styles.precioCard}>
              <Text style={styles.precioTipo}>{p.tipo}</Text>
              <Text style={styles.precioValor}>S/{p.precio.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.precioCard}>
            <Text style={styles.precioTipo}>Espera</Text>
            <Text style={[styles.precioValor, styles.tiempoValor]}>{grifo.tiempoEspera}</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>Cómo llegar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnClose} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.btnCloseText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  direccion: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeAbierto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  badgeDistancia: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  starBtn: {
    padding: 8,
    marginLeft: 8,
  },
  star: {
    fontSize: 28,
    color: Colors.textMuted,
  },
  starActive: {
    color: Colors.orange,
  },
  precios: {
    marginBottom: 16,
  },
  preciosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  precioCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  precioTipo: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  precioValor: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tiempoValor: {
    color: Colors.green,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.orange,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  btnClose: {
    width: 80,
    backgroundColor: Colors.surface,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnCloseText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
})

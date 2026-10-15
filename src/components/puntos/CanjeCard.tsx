import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/colors'
import type { Canje } from '../../types'

const ICON_MAP: Record<string, string> = {
  fuel: '⛽',
  store: '🏪',
  car: '🚗',
  gift: '🎁',
}

interface CanjeCardProps {
  canje: Canje
  onPress: (canje: Canje) => void
}

export function CanjeCard({ canje, onPress }: CanjeCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(canje)} activeOpacity={0.85}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{ICON_MAP[canje.icono] || '🎁'}</Text>
      </View>
      <Text style={styles.nombre}>{canje.nombre}</Text>
      <Text style={styles.descripcion}>{canje.descripcion}</Text>
      <View style={styles.footer}>
        <Text style={styles.puntos}>{canje.puntos.toLocaleString()} pts</Text>
        <View style={styles.btnCanjear}>
          <Text style={styles.btnText}>Canjear</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
  },
  nombre: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  puntos: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.orange,
  },
  btnCanjear: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
})

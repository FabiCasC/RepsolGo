import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'
import { Colors } from '../../constants/colors'
import type { Canje } from '../../types'

function CanjeIcon({ tipo, color = Colors.orange, size = 22 }: { tipo: string; color?: string; size?: number }) {
  switch (tipo) {
    case 'fuel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Rect x="5" y="6" width="6" height="4" rx="1" stroke={color} strokeWidth={1.8} />
          <Line x1="3" y1="22" x2="13" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
    case 'store':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Rect x="9" y="22" width="6" height="-6" stroke={color} strokeWidth={1.8} />
          <Path d="M9 22V16h6v6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
    case 'car':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Rect x="9" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={1.8} />
          <Circle cx="12" cy="21" r="1" stroke={color} strokeWidth={1.8} />
          <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth={1.8} />
        </Svg>
      )
    case 'gift':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="8" width="18" height="4" rx="1" stroke={color} strokeWidth={1.8} />
          <Path d="M21 12v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9" stroke={color} strokeWidth={1.8} />
          <Line x1="12" y1="8" x2="12" y2="22" stroke={color} strokeWidth={1.8} />
          <Path d="M12 8C10 8 8 7 8 5a2 2 0 014 0M12 8c2 0 4-1 4-3a2 2 0 00-4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
  }
}

interface CanjeCardProps {
  canje: Canje
  onPress: (canje: Canje) => void
}

export function CanjeCard({ canje, onPress }: CanjeCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(canje)} activeOpacity={0.85}>
      <View style={styles.iconContainer}>
        <CanjeIcon tipo={canje.icono} color={Colors.orange} size={22} />
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

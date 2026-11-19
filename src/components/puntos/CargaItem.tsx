import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg'
import { Colors } from '../../constants/colors'
import { Badge } from '../ui/Badge'
import type { Punto } from '../../types'

interface CargaItemProps {
  punto: Punto
}

const TIPO_COLOR: Record<string, string> = {
  carga: '#FFF3E0',
  escaneo: '#EEF2FF',
  bonus: '#FFFBEB',
  canje: '#FEE2E2',
}

function TipoIcon({ tipo, size = 20 }: { tipo: string; size?: number }) {
  switch (tipo) {
    case 'carga':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round" />
          <Rect x="5" y="6" width="6" height="4" rx="1" stroke={Colors.orange} strokeWidth={1.8} />
          <Line x1="3" y1="22" x2="13" y2="22" stroke={Colors.orange} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
    case 'escaneo':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4338CA" strokeWidth={1.8} strokeLinejoin="round" />
          <Polyline points="14,2 14,8 20,8" stroke="#4338CA" strokeWidth={1.8} strokeLinejoin="round" />
          <Line x1="16" y1="13" x2="8" y2="13" stroke="#4338CA" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="16" y1="17" x2="8" y2="17" stroke="#4338CA" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
    case 'bonus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#D97706" strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
    case 'canje':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="8" width="18" height="4" rx="1" stroke="#DC2626" strokeWidth={1.8} />
          <Path d="M21 12v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9" stroke="#DC2626" strokeWidth={1.8} />
          <Line x1="12" y1="8" x2="12" y2="22" stroke="#DC2626" strokeWidth={1.8} />
        </Svg>
      )
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="4" stroke={Colors.textMuted} strokeWidth={1.8} />
        </Svg>
      )
  }
}

export function CargaItem({ punto }: CargaItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: TIPO_COLOR[punto.tipo] || '#F3F4F6' }]}>
        <TipoIcon tipo={punto.tipo} size={20} />
      </View>
      <View style={styles.info}>
        <Text style={styles.descripcion}>{punto.descripcion}</Text>
        <Text style={styles.detalles}>
          {punto.grifoNombre ? `${punto.grifoNombre} · ` : ''}{punto.fecha}
        </Text>
        {punto.badge ? (
          <Badge label={punto.badge} variant="indigo" style={styles.badge} />
        ) : null}
      </View>
      <Text style={styles.puntos}>+{punto.cantidad} pts</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  descripcion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  detalles: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    marginTop: 4,
  },
  puntos: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.green,
    marginLeft: 8,
  },
})

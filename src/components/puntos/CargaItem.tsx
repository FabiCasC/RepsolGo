import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import { Badge } from '../ui/Badge'
import type { Punto } from '../../types'

interface CargaItemProps {
  punto: Punto
}

const TIPO_ICON: Record<string, string> = {
  carga: '⛽',
  escaneo: '📄',
  bonus: '⭐',
  canje: '🎁',
}

const TIPO_COLOR: Record<string, string> = {
  carga: '#FFF3E0',
  escaneo: '#EEF2FF',
  bonus: '#FFFBEB',
  canje: '#FEE2E2',
}

export function CargaItem({ punto }: CargaItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: TIPO_COLOR[punto.tipo] || '#F3F4F6' }]}>
        <Text style={styles.icon}>{TIPO_ICON[punto.tipo] || '•'}</Text>
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
  icon: {
    fontSize: 20,
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

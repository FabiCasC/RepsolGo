import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg'
import { Colors } from '../../constants/colors'
import type { Reto } from '../../types'

interface RetoCardProps {
  reto: Reto
}

function RetoIcon({ icono, color, size = 22 }: { icono: string; color: string; size?: number }) {
  switch (icono) {
    case 'zap':
    case '⚡':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
    case 'sunrise':
    case '🌅':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M17 18a5 5 0 00-10 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="12" y1="2" x2="12" y2="9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="4.22" y1="10.22" x2="5.64" y2="11.64" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="1" y1="18" x2="3" y2="18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="21" y1="18" x2="23" y2="18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="18.36" y1="11.64" x2="19.78" y2="10.22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="23" y1="22" x2="1" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Polyline points="8,6 12,2 16,6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
    case 'map':
    case '🗺️':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Line x1="9" y1="3" x2="9" y2="18" stroke={color} strokeWidth={1.8} />
          <Line x1="15" y1="6" x2="15" y2="21" stroke={color} strokeWidth={1.8} />
        </Svg>
      )
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
  }
}

export function RetoCard({ reto }: RetoCardProps) {
  const pct = reto.progreso / reto.meta
  const isAlmostDone = pct >= 0.75

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: reto.color + '22' }]}>
          <RetoIcon icono={reto.icono} color={reto.color} size={22} />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.titulo}>{reto.titulo}</Text>
          <Text style={styles.descripcion}>{reto.descripcion}</Text>
        </View>
        {isAlmostDone && (
          <View style={styles.almostBadge}>
            <Text style={styles.almostText}>¡Casi!</Text>
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            {reto.progreso}/{reto.meta}
          </Text>
          <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${pct * 100}%` as `${number}%`, backgroundColor: reto.color },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.rewards}>
          <View style={styles.rewardChip}>
            <Text style={styles.rewardText}>+{reto.puntos} pts</Text>
          </View>
          <View style={[styles.rewardChip, styles.xpChip]}>
            <Text style={[styles.rewardText, styles.xpText]}>+{reto.xp} XP</Text>
          </View>
        </View>
        <Text style={styles.vencimiento}>Vence {reto.fechaVencimiento}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  descripcion: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  almostBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  almostText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.orange,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardChip: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpChip: {
    backgroundColor: '#EEF2FF',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.orange,
  },
  xpText: {
    color: '#4338CA',
  },
  vencimiento: {
    fontSize: 11,
    color: Colors.textMuted,
  },
})

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import type { Reto } from '../../types'

interface RetoCardProps {
  reto: Reto
}

const ICONS: Record<string, string> = {
  '⚡': '⚡',
  '🌅': '🌅',
  '🗺️': '🗺️',
  default: '🏆',
}

export function RetoCard({ reto }: RetoCardProps) {
  const pct = reto.progreso / reto.meta
  const isAlmostDone = pct >= 0.75

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: reto.color + '22' }]}>
          <Text style={styles.icon}>{reto.icono}</Text>
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
  icon: {
    fontSize: 22,
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

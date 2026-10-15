import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import type { Badge } from '../../types'

interface BadgeGridProps {
  badges: Badge[]
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <View style={styles.grid}>
      {badges.map(badge => (
        <View key={badge.id} style={styles.badgeItem}>
          <View
            style={[
              styles.badgeCircle,
              badge.ganado
                ? { backgroundColor: badge.color || Colors.orange }
                : styles.badgeLocked,
            ]}
          >
            {badge.ganado ? (
              <Text style={styles.badgeIcon}>{badge.icono}</Text>
            ) : (
              <Text style={styles.lockIcon}>🔒</Text>
            )}
          </View>
          <Text style={[styles.badgeName, !badge.ganado && styles.badgeNameLocked]}>
            {badge.nombre}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    width: '22%',
    alignItems: 'center',
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeLocked: {
    backgroundColor: '#E5E7EB',
  },
  badgeIcon: {
    fontSize: 26,
  },
  lockIcon: {
    fontSize: 20,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: Colors.textMuted,
  },
})

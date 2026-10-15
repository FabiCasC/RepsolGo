import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg'
import { Colors } from '../../constants/colors'
import type { Badge } from '../../types'

interface BadgeGridProps {
  badges: Badge[]
}

function BadgeIcon({ icono, color, size = 26 }: { icono: string; color: string; size?: number }) {
  switch (icono) {
    case 'rocket':
    case '🚀':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
    case 'heart':
    case '❤️':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
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
    case 'sunrise':
    case '🌅':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M17 18a5 5 0 00-10 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="12" y1="9" x2="12" y2="2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Line x1="1" y1="18" x2="23" y2="18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      )
    case 'diamond':
    case '💎':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 3h12l4 6-10 13L2 9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M2 9h20M12 3L8 9l4 13 4-13-4-6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
      )
    case 'crown':
    case '👑':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M2 19h20M2 19l3-9 5 4 2-7 2 7 5-4 3 9" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      )
    case 'piggy':
    case '💰':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke={color} strokeWidth={1.8} />
          <Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )
    case 'star':
    case '⭐':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
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

function IcoLock({ color = '#9CA3AF', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
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
              <BadgeIcon icono={badge.icono} color="#fff" size={26} />
            ) : (
              <IcoLock color="#9CA3AF" size={20} />
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

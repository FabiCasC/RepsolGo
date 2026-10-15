import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '../../constants/colors'

type BadgeVariant = 'orange' | 'navy' | 'green' | 'red' | 'indigo' | 'gray'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  style?: ViewStyle
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  orange: { bg: '#FFF3E0', text: Colors.orange },
  navy: { bg: '#E8EDF4', text: Colors.navy },
  green: { bg: '#DCFCE7', text: '#15803D' },
  red: { bg: '#FEE2E2', text: Colors.red },
  indigo: { bg: '#EEF2FF', text: '#4338CA' },
  gray: { bg: '#F3F4F6', text: Colors.textSecondary },
}

export function Badge({ label, variant = 'gray', style }: BadgeProps) {
  const colors = VARIANT_COLORS[variant]
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
})

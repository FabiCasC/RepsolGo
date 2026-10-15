import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Colors } from '../../constants/colors'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

interface ButtonProps {
  onPress: () => void
  label: string
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.navy : Colors.white} size="small" />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: Colors.orange,
  },
  secondary: {
    backgroundColor: Colors.navy,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.navy,
  },
  danger: {
    backgroundColor: Colors.red,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
})

const labelStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.white },
  secondary: { color: Colors.white },
  outline: { color: Colors.navy },
  danger: { color: Colors.white },
}

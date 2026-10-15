import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native'
import { Colors } from '../../constants/colors'

interface InputProps extends TextInputProps {
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  onRightIconPress?: () => void
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  error,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, !leftIcon && styles.inputNoPadding, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: Colors.orange,
  },
  inputError: {
    borderColor: Colors.red,
  },
  leftIcon: {
    paddingLeft: 14,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 14,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 14,
    paddingLeft: 14,
  },
  inputNoPadding: {
    paddingLeft: 14,
  },
  error: {
    fontSize: 12,
    color: Colors.red,
    marginTop: 4,
  },
})

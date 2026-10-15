import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../src/constants/colors'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { AuthService } from '../../src/services/auth.service'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null])

  function handleOtpChange(text: string, index: number) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 1)
    const newOtp = [...otp]
    newOtp[index] = cleaned
    setOtp(newOtp)
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    const fullOtp = otp.join('')
    if (fullOtp.length < 6) errs.otp = 'Ingresa el código completo de 6 dígitos'
    if (!newPassword) errs.newPassword = 'Ingresa la nueva contraseña'
    else if (newPassword.length < 6) errs.newPassword = 'Mínimo 6 caracteres'
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleReset() {
    if (!validate()) return
    setLoading(true)
    try {
      await AuthService.resetPassword(otp.join(''), newPassword)
      Alert.alert('¡Listo!', 'Tu contraseña fue restablecida correctamente.', [
        { text: 'Iniciar sesión', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch {
      Alert.alert('Error', 'No se pudo restablecer la contraseña. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa el código de 6 dígitos que enviamos a tu email.
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => { inputRefs.current[i] = ref }}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, i)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
            {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

            <View style={styles.passwordSection}>
              <Input
                label="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                error={errors.newPassword}
              />
              <Input
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                secureTextEntry
                error={errors.confirmPassword}
              />
            </View>

            <Button
              label="Restablecer contraseña"
              onPress={handleReset}
              loading={loading}
              fullWidth
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.resendBtn}>
              <Text style={styles.resendText}>¿No recibiste el código? </Text>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backArrow: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  otpInputFilled: {
    borderColor: Colors.orange,
    backgroundColor: '#FFF3E0',
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    marginBottom: 8,
  },
  passwordSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  resendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
  },
})

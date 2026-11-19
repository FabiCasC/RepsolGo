import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/store/auth.store'
import { Colors } from '../src/constants/colors'

export default function Index() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/(auth)/login')
    } else if (user?.rol === 'operario') {
      router.replace('/(operario)/escanear-placa')
    } else {
      router.replace('/(app)/mapa')
    }
  }, [isAuthenticated, isLoading, user, router])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.navy }}>
      <ActivityIndicator size="large" color={Colors.orange} />
    </View>
  )
}

import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { getFirebaseAuth } from '../src/lib/firebase'
import { useAuthStore } from '../src/store/auth.store'
import { Colors } from '../src/constants/colors'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function RootNavigator() {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Inicializar Firebase Auth AQUI, dentro de un componente montado,
    // cuando React Native ya registró todos los módulos nativos
    try {
      getFirebaseAuth()
    } catch (e) {
      console.warn('Firebase auth init error:', e)
    }
    setAuthReady(true)
    checkAuth()
  }, [])

  if (!authReady || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.navy }}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    )
  }

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    )
  }

  if (user?.rol === 'operario') {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(operario)" />
      </Stack>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <RootNavigator />
    </QueryClientProvider>
  )
}

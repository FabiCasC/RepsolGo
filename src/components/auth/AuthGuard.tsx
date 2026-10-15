import React from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }
  return <>{children}</>
}

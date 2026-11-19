import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../src/constants/colors'
import Svg, { Path, Circle, Polygon } from 'react-native-svg'
import { AuthGuard } from '../../src/components/auth/AuthGuard'

function MapIcon({ color }: { color: string }) {
  return (
    <View style={tabIconStyles.container}>
      <View style={[tabIconStyles.mapBody, { borderColor: color }]}>
        <View style={[tabIconStyles.mapPin, { backgroundColor: color }]} />
      </View>
    </View>
  )
}

function StarIcon({ color }: { color: string }) {
  return (
    <View style={tabIconStyles.container}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    </View>
  )
}

function CameraIcon({ color }: { color: string }) {
  return (
    <View style={[tabIconStyles.scanCircle, { backgroundColor: color === Colors.orange ? Colors.orange : '#374151' }]}>
      <Text style={tabIconStyles.scanText}>⊙</Text>
    </View>
  )
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <View style={tabIconStyles.container}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M5 3H3v5a4 4 0 004 4M19 3h2v5a4 4 0 01-4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M7 3h10v7a5 5 0 01-10 0V3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    </View>
  )
}

function UserIcon({ color }: { color: string }) {
  return (
    <View style={tabIconStyles.container}>
      <View style={[tabIconStyles.userHead, { backgroundColor: color }]} />
      <View style={[tabIconStyles.userBody, { backgroundColor: color }]} />
    </View>
  )
}

export default function AppLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.orange,
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            backgroundColor: Colors.white,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => <MapIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="puntos"
          options={{
            title: 'Puntos',
            tabBarIcon: ({ color }) => <StarIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="escanear"
          options={{
            title: 'Escanear',
            tabBarIcon: () => (
              <View style={tabIconStyles.scanWrapper}>
                <View style={tabIconStyles.scanButton}>
                  <Text style={tabIconStyles.scanButtonText}>⊙</Text>
                </View>
              </View>
            ),
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              color: Colors.orange,
            },
          }}
        />
        <Tabs.Screen
          name="viaje"
          options={{
            title: 'Viaje',
            tabBarIcon: ({ color }) => (
              <View style={tabIconStyles.container}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 17H3a2 2 0 01-2-2V9a7 7 0 017-7h8a7 7 0 017 7v6a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
                  <Path d="M7 17h10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
                  <Circle cx="7.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8} />
                  <Circle cx="16.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8} />
                </Svg>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="retos"
          options={{
            title: 'Retos',
            tabBarIcon: ({ color }) => <TrophyIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <UserIcon color={color} />,
          }}
        />
        <Tabs.Screen name="gamificacion" options={{ href: null }} />
        <Tabs.Screen name="incidencias" options={{ href: null }} />
        <Tabs.Screen name="turno" options={{ href: null }} />
        <Tabs.Screen name="delivery" options={{ href: null }} />
        <Tabs.Screen name="ranking" options={{ href: null }} />
        <Tabs.Screen name="huella" options={{ href: null }} />
        <Tabs.Screen name="factura" options={{ href: null }} />
        <Tabs.Screen name="ocr-boleta" options={{ href: null }} />
        <Tabs.Screen name="ayuda" options={{ href: null }} />
        <Tabs.Screen name="terminos" options={{ href: null }} />
        <Tabs.Screen name="privacidad" options={{ href: null }} />
      </Tabs>
    </AuthGuard>
  )
}

const tabIconStyles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  mapBody: {
    width: 18,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 1,
  },
  userBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  scanCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontSize: 16,
    color: Colors.white,
  },
  scanWrapper: {
    marginTop: -16,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  scanButtonText: {
    fontSize: 24,
    color: Colors.white,
  },
})

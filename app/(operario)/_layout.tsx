import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { Colors } from '../../src/constants/colors'

function ScanIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={1.8}/><Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>
    </View>
  )
}

function AlertIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/><Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>
    </View>
  )
}

function ClockIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8}/><Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>
    </View>
  )
}

function UserIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <View style={[s.head, { backgroundColor: color }]} />
      <View style={[s.body, { backgroundColor: color }]} />
    </View>
  )
}

export default function OperarioLayout() {
  return (
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
        name="escanear-placa"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color }) => <ScanIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="incidencias"
        options={{
          title: 'Incidencias',
          tabBarIcon: ({ color }) => <AlertIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="registro-turno"
        options={{
          title: 'Turno',
          tabBarIcon: ({ color }) => <ClockIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tabs>
  )
}

const s = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  head: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 1,
  },
  body: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
})

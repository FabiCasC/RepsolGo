import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../src/constants/colors'

function ScanIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Text style={[s.emoji, { color }]}>🔍</Text>
    </View>
  )
}

function AlertIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Text style={[s.emoji, { color }]}>⚠️</Text>
    </View>
  )
}

function ClockIcon({ color }: { color: string }) {
  return (
    <View style={s.iconContainer}>
      <Text style={[s.emoji, { color }]}>🕐</Text>
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

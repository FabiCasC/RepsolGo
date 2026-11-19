import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import Svg, { Path } from 'react-native-svg'
import { Colors } from '../../constants/colors'
import type { Grifo } from '../../types'

interface GrifoMarkerProps {
  grifo: Grifo
  onPress: (grifo: Grifo) => void
  selected?: boolean
}

export function GrifoMarker({ grifo, onPress, selected = false }: GrifoMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude: grifo.latitude, longitude: grifo.longitude }}
      onPress={() => onPress(grifo)}
      title={grifo.nombre}
      tracksViewChanges={false}
    >
      <View style={styles.wrapper}>
        <View style={[styles.pin, selected && styles.pinSelected]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 22V4a1 1 0 011-1h10a1 1 0 011 1v9" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M15 13h2a2 2 0 012 2v3a2 2 0 002 2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M5 6h6M3 22h10" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
        </View>
        <View style={[styles.tail, selected && styles.tailSelected]} />
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  pin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  pinSelected: {
    backgroundColor: Colors.red,
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.orange,
    marginTop: -2,
  },
  tailSelected: {
    borderTopColor: Colors.red,
  },
})

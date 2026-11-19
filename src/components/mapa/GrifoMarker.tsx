import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
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
          <Text style={styles.pinIcon}>⛽</Text>
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
  pinIcon: {
    fontSize: 20,
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

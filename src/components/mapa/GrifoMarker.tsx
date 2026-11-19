import React from 'react'
import { View, StyleSheet } from 'react-native'
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
    >
      <View style={[styles.markerContainer, selected && styles.markerSelected]}>
        <View style={[styles.marker, selected && styles.markerSelectedBg]}>
          <View style={styles.pinInner} />
        </View>
        <View style={[styles.markerTail, selected && styles.markerTailSelected]} />
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerSelected: {},
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelectedBg: {
    backgroundColor: Colors.red,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  pinInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.orange,
    marginTop: -2,
  },
  markerTailSelected: {
    borderTopColor: Colors.red,
  },
})

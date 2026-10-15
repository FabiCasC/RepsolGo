import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import { Svg, Path, G } from 'react-native-svg'
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
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill={Colors.white}
            />
          </Svg>
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

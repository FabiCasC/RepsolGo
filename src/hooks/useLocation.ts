import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        if (mounted) {
          setState(prev => ({ ...prev, error: 'Permiso de ubicación denegado', loading: false }))
        }
        return
      }
      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        if (mounted) {
          setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            error: null,
            loading: false,
          })
        }
      } catch {
        if (mounted) {
          setState(prev => ({ ...prev, error: 'No se pudo obtener la ubicación', loading: false }))
        }
      }
    })()
    return () => { mounted = false }
  }, [])

  return state
}

import { FirestoreService } from './firestore.service'
import type { Grifo } from '../types'

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'
const DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json'
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json'

function getApiKey(): string {
  // La key viene de app.config.js via expo-constants en runtime,
  // pero para llamadas REST la leemos del process.env en build time.
  // En desarrollo usar variable de entorno GOOGLE_MAPS_API_KEY
  return (global as any).__GOOGLE_MAPS_API_KEY__ ?? process.env.GOOGLE_MAPS_API_KEY ?? ''
}

export interface LatLng {
  latitude: number
  longitude: number
}

export interface GrifoRuta extends Grifo {
  distanciaMetros: number
  duracionSegundos: number
  distanciaTexto: string
  duracionTexto: string
}

// Convierte un resultado de Places API al tipo Grifo de la app
function placesToGrifo(place: any): Omit<Grifo, 'id'> {
  const precios = [
    { tipo: 'Gasolina 90', precio: 0 },
    { tipo: 'Gasolina 95', precio: 0 },
    { tipo: 'Diesel B5', precio: 0 },
  ]
  return {
    nombre: place.name ?? 'Grifo Repsol',
    direccion: place.vicinity ?? place.formatted_address ?? '',
    latitude: place.geometry?.location?.lat ?? 0,
    longitude: place.geometry?.location?.lng ?? 0,
    precios,
    tiempoEspera: '~5 min',
    abierto24h: place.opening_hours?.open_now ?? true,
    distancia: '',
    esFavorito: false,
    placeId: place.place_id ?? '',
    rating: place.rating ?? 0,
  }
}

export const PlacesService = {
  /**
   * Busca grifos Repsol reales cerca de una ubicación.
   * Los persiste en Firestore para uso offline (upsert por placeId).
   */
  async buscarGrifosCercanos(
    ubicacion: LatLng,
    radioMetros = 10000,
    apiKey?: string
  ): Promise<Grifo[]> {
    const key = apiKey ?? getApiKey()
    if (!key) {
      console.warn('[PlacesService] No hay Google Maps API key — cargando desde Firestore')
      return FirestoreService.getGrifos()
    }

    const url =
      `${PLACES_BASE}/nearbysearch/json` +
      `?location=${ubicacion.latitude},${ubicacion.longitude}` +
      `&radius=${radioMetros}` +
      `&type=gas_station` +
      `&keyword=Repsol` +
      `&language=es` +
      `&key=${key}`

    try {
      const res = await fetch(url)
      const data = await res.json()

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('[PlacesService] Error Places API:', data.status, data.error_message)
        return FirestoreService.getGrifos()
      }

      const grifos: Grifo[] = (data.results ?? []).map((place: any) => ({
        id: place.place_id,
        ...placesToGrifo(place),
      }))

      // Persistir en Firestore para acceso offline
      await PlacesService.persistirGrifos(grifos)
      return grifos
    } catch (err) {
      console.error('[PlacesService] fetch error:', err)
      return FirestoreService.getGrifos()
    }
  },

  /**
   * Guarda o actualiza grifos en Firestore (upsert por id = place_id).
   */
  async persistirGrifos(grifos: Grifo[]): Promise<void> {
    const { setDoc, doc, collection } = await import('@firebase/firestore')
    const { db } = await import('../lib/firebase')
    for (const grifo of grifos) {
      const { id, ...data } = grifo
      await setDoc(doc(db, 'grifos', id), data, { merge: true })
    }
  },

  /**
   * Geocodifica un texto de dirección/ciudad a coordenadas.
   */
  async geocodificar(texto: string, apiKey?: string): Promise<LatLng | null> {
    const key = apiKey ?? getApiKey()
    if (!key) return null

    const url =
      `${GEOCODE_BASE}?address=${encodeURIComponent(texto)}&language=es&key=${key}`

    try {
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 'OK' && data.results.length > 0) {
        const loc = data.results[0].geometry.location
        return { latitude: loc.lat, longitude: loc.lng }
      }
    } catch (err) {
      console.error('[PlacesService] geocode error:', err)
    }
    return null
  },

  /**
   * Busca grifos Repsol a lo largo de una ruta (origen → destino).
   * Usa Directions API para obtener waypoints de la ruta,
   * luego busca grifos cerca de cada segmento.
   */
  async buscarGrifosEnRuta(
    origen: LatLng,
    destino: string,
    apiKey?: string
  ): Promise<GrifoRuta[]> {
    const key = apiKey ?? getApiKey()
    if (!key) {
      // Sin key: retornar grifos de Firestore como fallback
      const grifos = await FirestoreService.getGrifos()
      return grifos.map(g => ({
        ...g,
        distanciaMetros: 0,
        duracionSegundos: 0,
        distanciaTexto: 'Sin datos',
        duracionTexto: 'Sin datos',
      }))
    }

    // 1. Geocodificar el destino
    const destinoCoords = await PlacesService.geocodificar(destino, key)
    if (!destinoCoords) return []

    // 2. Obtener ruta con waypoints
    const dirUrl =
      `${DIRECTIONS_BASE}` +
      `?origin=${origen.latitude},${origen.longitude}` +
      `&destination=${destinoCoords.latitude},${destinoCoords.longitude}` +
      `&language=es` +
      `&key=${key}`

    let rutaPuntos: LatLng[] = [origen, destinoCoords]
    let legDistancia = ''
    let legDuracion = ''

    try {
      const res = await fetch(dirUrl)
      const data = await res.json()
      if (data.status === 'OK' && data.routes.length > 0) {
        const leg = data.routes[0].legs[0]
        legDistancia = leg.distance.text
        legDuracion = leg.duration.text

        // Tomar puntos intermedios cada ~30km
        const steps = leg.steps ?? []
        const puntos: LatLng[] = [origen]
        let acum = 0
        for (const step of steps) {
          acum += step.distance.value
          if (acum >= 30000) {
            puntos.push({ latitude: step.end_location.lat, longitude: step.end_location.lng })
            acum = 0
          }
        }
        puntos.push(destinoCoords)
        rutaPuntos = puntos
      }
    } catch (err) {
      console.error('[PlacesService] directions error:', err)
    }

    // 3. Buscar grifos cerca de cada punto intermedio
    const grifoMap = new Map<string, GrifoRuta>()

    for (let i = 0; i < rutaPuntos.length; i++) {
      const punto = rutaPuntos[i]
      const url =
        `${PLACES_BASE}/nearbysearch/json` +
        `?location=${punto.latitude},${punto.longitude}` +
        `&radius=15000` +
        `&type=gas_station` +
        `&keyword=Repsol` +
        `&language=es` +
        `&key=${key}`

      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.status === 'OK') {
          for (const place of data.results ?? []) {
            if (!grifoMap.has(place.place_id)) {
              const base: Grifo = { id: place.place_id, ...placesToGrifo(place) }
              // Estimar distancia relativa en la ruta (proporción del índice)
              const distProporcional = Math.round(
                (i / (rutaPuntos.length - 1 || 1)) * (parseFloat(legDistancia) || 0)
              )
              grifoMap.set(place.place_id, {
                ...base,
                distanciaMetros: distProporcional * 1000,
                duracionSegundos: 0,
                distanciaTexto: distProporcional > 0 ? `~${distProporcional} km` : 'En ruta',
                duracionTexto: legDuracion || 'Ver mapa',
              })
            }
          }
        }
      } catch (err) {
        console.error('[PlacesService] nearbysearch error en waypoint:', err)
      }
    }

    const resultado = Array.from(grifoMap.values()).sort(
      (a, b) => a.distanciaMetros - b.distanciaMetros
    )

    // Persistir en Firestore
    if (resultado.length > 0) {
      await PlacesService.persistirGrifos(resultado)
    }

    return resultado
  },
}

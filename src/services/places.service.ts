import { FirestoreService } from './firestore.service'
import type { Grifo } from '../types'

const DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json'
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json'

function getApiKey(): string {
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

/** Distancia en metros entre dos puntos (fórmula de Haversine) */
function haversineMetros(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const c =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLon * sinDLon
  return R * 2 * Math.asin(Math.sqrt(c))
}

function formatDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`
  return `${(metros / 1000).toFixed(1)} km`
}

export const PlacesService = {
  /**
   * Busca grifos Repsol reales cerca de una ubicación.
   * Usa el JSON local (grifos-lima.json) con haversine — sin red requerida.
   */
  async buscarGrifosCercanos(
    ubicacion: LatLng,
    radioMetros = 15000
  ): Promise<Grifo[]> {
    try {
      const grifosLocales: Grifo[] = require('../data/grifos-lima.json')
      const cercanos = grifosLocales
        .map(g => ({
          ...g,
          distancia: formatDistancia(haversineMetros(ubicacion, g)),
        }))
        .filter(g => haversineMetros(ubicacion, g) <= radioMetros)
        .sort((a, b) => haversineMetros(ubicacion, a) - haversineMetros(ubicacion, b))

      if (cercanos.length > 0) return cercanos
      // Si no hay nada en el radio, retornar todos ordenados por distancia
      return grifosLocales
        .map(g => ({
          ...g,
          distancia: formatDistancia(haversineMetros(ubicacion, g)),
        }))
        .sort((a, b) => haversineMetros(ubicacion, a) - haversineMetros(ubicacion, b))
    } catch (err) {
      console.error('[PlacesService] Error leyendo JSON local:', err)
      return FirestoreService.getGrifos()
    }
  },

  /**
   * Guarda o actualiza grifos en Firestore (upsert por id).
   */
  async persistirGrifos(grifos: Grifo[]): Promise<void> {
    try {
      const { setDoc, doc } = await import('@firebase/firestore')
      const { db } = await import('../lib/firebase')
      for (const grifo of grifos) {
        const { id, ...data } = grifo
        await setDoc(doc(db, 'grifos', id), data, { merge: true })
      }
    } catch (err) {
      console.warn('[PlacesService] Error persistiendo en Firestore:', err)
    }
  },

  /**
   * Geocodifica un texto de dirección/ciudad a coordenadas usando Geocoding API.
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
      console.warn('[PlacesService] Geocode status:', data.status)
    } catch (err) {
      console.error('[PlacesService] geocode error:', err)
    }
    return null
  },

  /**
   * Busca grifos Repsol a lo largo de una ruta (origen → destino).
   * Usa Directions API para obtener waypoints de la ruta,
   * luego filtra el JSON local (grifos-lima.json) por distancia haversine.
   * No depende de Overpass ni de llamadas por waypoint — sin 502.
   */
  async buscarGrifosEnRuta(
    origen: LatLng,
    destino: string,
    apiKey?: string
  ): Promise<GrifoRuta[]> {
    // Cargar datos locales (siempre disponibles, sin red)
    let grifosLocales: Grifo[] = []
    try {
      grifosLocales = require('../data/grifos-lima.json')
    } catch (err) {
      console.error('[PlacesService] Error leyendo JSON local:', err)
      grifosLocales = await FirestoreService.getGrifos()
    }

    const key = apiKey ?? getApiKey()

    // Sin key: retornar todos los grifos locales ordenados por distancia al origen
    if (!key) {
      console.warn('[PlacesService] Sin API key — mostrando grifos locales por distancia')
      return grifosLocales
        .map(g => ({
          ...g,
          distanciaMetros: Math.round(haversineMetros(origen, g)),
          duracionSegundos: 0,
          distanciaTexto: formatDistancia(haversineMetros(origen, g)),
          duracionTexto: 'Ver mapa',
        }))
        .sort((a, b) => a.distanciaMetros - b.distanciaMetros)
    }

    // 1. Geocodificar el destino
    const destinoCoords = await PlacesService.geocodificar(destino, key)
    if (!destinoCoords) {
      console.warn('[PlacesService] No se pudo geocodificar:', destino, '— usando grifos locales')
      return grifosLocales
        .map(g => ({
          ...g,
          distanciaMetros: Math.round(haversineMetros(origen, g)),
          duracionSegundos: 0,
          distanciaTexto: formatDistancia(haversineMetros(origen, g)),
          duracionTexto: 'Ver mapa',
        }))
        .sort((a, b) => a.distanciaMetros - b.distanciaMetros)
    }

    // 2. Obtener waypoints de la ruta con Directions API
    const dirUrl =
      `${DIRECTIONS_BASE}` +
      `?origin=${origen.latitude},${origen.longitude}` +
      `&destination=${destinoCoords.latitude},${destinoCoords.longitude}` +
      `&language=es` +
      `&key=${key}`

    let rutaPuntos: LatLng[] = [origen, destinoCoords]
    let legDistanciaTexto = ''
    let legDuracionTexto = ''

    try {
      const res = await fetch(dirUrl)
      const data = await res.json()
      if (data.status === 'OK' && data.routes.length > 0) {
        const leg = data.routes[0].legs[0]
        legDistanciaTexto = leg.distance.text   // ej: "120 km"
        legDuracionTexto = leg.duration.text    // ej: "1 hora 45 min"

        // Waypoints cada ~30km
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
      } else {
        console.warn('[PlacesService] Directions status:', data.status, '— usando línea recta')
      }
    } catch (err) {
      console.error('[PlacesService] directions error:', err)
    }

    // 3. Filtrar grifos locales dentro de 15km de cualquier waypoint (haversine)
    const RADIO_RUTA_M = 15000
    const grifoMap = new Map<string, GrifoRuta>()
    const totalPuntos = rutaPuntos.length - 1 || 1
    const distanciaTotal = parseFloat(legDistanciaTexto) || 0

    for (let i = 0; i < rutaPuntos.length; i++) {
      const punto = rutaPuntos[i]
      for (const grifo of grifosLocales) {
        if (grifoMap.has(grifo.id)) continue
        const distAlPunto = haversineMetros(punto, {
          latitude: grifo.latitude,
          longitude: grifo.longitude,
        })
        if (distAlPunto <= RADIO_RUTA_M) {
          const distRutaKm =
            distanciaTotal > 0
              ? Math.round((i / totalPuntos) * distanciaTotal)
              : Math.round(haversineMetros(origen, grifo) / 1000)
          grifoMap.set(grifo.id, {
            ...grifo,
            distanciaMetros: distRutaKm * 1000,
            duracionSegundos: 0,
            distanciaTexto: distRutaKm > 0 ? `~${distRutaKm} km` : 'Al inicio',
            duracionTexto: legDuracionTexto || 'Ver mapa',
          })
        }
      }
    }

    let resultado = Array.from(grifoMap.values()).sort(
      (a, b) => a.distanciaMetros - b.distanciaMetros
    )

    // Si no hay resultados (destino fuera del rango de los grifos locales),
    // mostrar todos ordenados por distancia al origen — siempre útil
    if (resultado.length === 0) {
      console.warn('[PlacesService] Sin grifos en ruta — mostrando todos los locales')
      resultado = grifosLocales
        .map(g => ({
          ...g,
          distanciaMetros: Math.round(haversineMetros(origen, g)),
          duracionSegundos: 0,
          distanciaTexto: formatDistancia(haversineMetros(origen, g)),
          duracionTexto: legDuracionTexto || 'Ver mapa',
        }))
        .sort((a, b) => a.distanciaMetros - b.distanciaMetros)
    }

    return resultado
  },
}

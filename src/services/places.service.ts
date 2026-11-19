/**
 * PlacesService — versión gratuita (sin Google Maps API)
 *
 * APIs usadas (100% gratuitas, sin clave):
 *  - Nominatim (OSM)   → geocodificación (texto → coords)
 *  - Overpass API      → búsqueda de grifos Repsol por POI
 *  - OSRM              → rutas y direcciones (conducción)
 *
 * Límites:
 *  - Nominatim: 1 req/seg. Siempre enviar User-Agent.
 *  - Overpass:  sin límite estricto, pero cachear resultados.
 *  - OSRM:      servicio público demo.project-osrm.org, razonable para dev.
 */

import { FirestoreService } from './firestore.service'
import type { Grifo } from '../types'
import GRIFOS_LIMA from '../data/grifos-lima.json'

// User-Agent requerido por Nominatim (identifica la app)
const UA = 'RepsolGo/1.0 (proyecto universitario UTP; contacto: repsolgo@utp.edu.pe)'

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function mToKm(metros: number): string {
  if (metros < 1000) return `${metros} m`
  return `${(metros / 1000).toFixed(1)} km`
}

function secsToText(segundos: number): string {
  if (segundos < 60) return `${segundos} seg`
  const mins = Math.round(segundos / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** Distancia haversine entre dos puntos en metros */
function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const dLat = lat2 - lat1
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/** Convierte un elemento Overpass al tipo Grifo */
function overpassToGrifo(el: any): Grifo {
  const lat = el.lat ?? el.center?.lat ?? 0
  const lon = el.lon ?? el.center?.lon ?? 0
  const tags = el.tags ?? {}

  const nombre = tags.name ?? tags['name:es'] ?? 'Grifo Repsol'
  const calle = tags['addr:street'] ?? ''
  const num = tags['addr:housenumber'] ?? ''
  const distrito = tags['addr:city'] ?? tags['addr:suburb'] ?? ''
  const direccion = [calle, num, distrito].filter(Boolean).join(', ') || 'Lima, Perú'

  return {
    id: `osm_${el.type}_${el.id}`,
    nombre,
    direccion,
    latitude: lat,
    longitude: lon,
    precios: [
      { tipo: 'Gasolina 90', precio: 0 },
      { tipo: 'Gasolina 95', precio: 0 },
      { tipo: 'Diesel B5', precio: 0 },
    ],
    tiempoEspera: '~5 min',
    abierto24h: tags.opening_hours === '24/7',
    distancia: '',
    esFavorito: false,
    placeId: `${el.type}/${el.id}`,
    rating: 0,
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const PlacesService = {
  /**
   * Geocodifica texto → coords usando Nominatim (OSM).
   * Límite: 1 req/seg. Siempre envía User-Agent.
   */
  async geocodificar(texto: string): Promise<LatLng | null> {
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(texto + ', Peru')}` +
        `&format=json&limit=1&addressdetails=0`

      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
      })
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }
      }
    } catch (err) {
      console.error('[PlacesService] Nominatim error:', err)
    }
    return null
  },

  /**
   * Devuelve grifos Repsol ordenados por distancia al usuario.
   * Usa datos locales (Lima) para carga instantánea — sin esperar APIs externas.
   */
  async buscarGrifosCercanos(
    ubicacion: LatLng,
    _radioMetros = 10000
  ): Promise<Grifo[]> {
    // Calcular distancia a cada grifo local y ordenar
    const conDistancia = (GRIFOS_LIMA as Grifo[]).map(g => ({
      grifo: g,
      dist: haversine(ubicacion, { latitude: g.latitude, longitude: g.longitude }),
    }))
    conDistancia.sort((a, b) => a.dist - b.dist)
    const resultado = conDistancia.map(x => ({
      ...x.grifo,
      distancia: mToKm(Math.round(x.dist)),
    }))
    console.log(`[PlacesService] ${resultado.length} grifos locales cargados`)
    return resultado
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
      console.error('[PlacesService] Error persistiendo grifos:', err)
    }
  },

  /**
   * Busca grifos Repsol en la ruta origen → destino (texto).
   *  1. Geocodifica el destino con Nominatim
   *  2. Obtiene la ruta con OSRM
   *  3. Busca grifos Overpass cerca de puntos intermedios de la ruta
   */
  async buscarGrifosEnRuta(
    origen: LatLng,
    destino: string
  ): Promise<GrifoRuta[]> {
    const destinoCoords = await PlacesService.geocodificar(destino)
    if (!destinoCoords) {
      console.warn('[PlacesService] No se pudo geocodificar:', destino)
      const grifos = await FirestoreService.getGrifos()
      return grifos.map(g => ({
        ...g,
        distanciaMetros: 0,
        duracionSegundos: 0,
        distanciaTexto: 'Sin datos',
        duracionTexto: 'Sin datos',
      }))
    }

    let rutaPuntos: LatLng[] = [origen, destinoCoords]
    let totalDistMetros = 0
    let totalDurSecs = 0

    try {
      const osrmUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${origen.longitude},${origen.latitude};` +
        `${destinoCoords.longitude},${destinoCoords.latitude}` +
        `?overview=full&geometries=geojson&steps=true`

      const res = await fetch(osrmUrl, { headers: { 'User-Agent': UA } })
      const data = await res.json()

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0]
        totalDistMetros = Math.round(route.distance)
        totalDurSecs = Math.round(route.duration)

        const coords: [number, number][] = route.geometry?.coordinates ?? []
        const puntos: LatLng[] = [origen]
        let acumMetros = 0
        for (let i = 1; i < coords.length; i++) {
          const prev: LatLng = { latitude: coords[i - 1][1], longitude: coords[i - 1][0] }
          const curr: LatLng = { latitude: coords[i][1], longitude: coords[i][0] }
          acumMetros += haversine(prev, curr)
          if (acumMetros >= 20000) {
            puntos.push(curr)
            acumMetros = 0
          }
        }
        puntos.push(destinoCoords)
        rutaPuntos = puntos
      }
    } catch (err) {
      console.error('[PlacesService] OSRM error:', err)
    }

    const grifoMap = new Map<string, GrifoRuta>()

    for (let i = 0; i < rutaPuntos.length; i++) {
      const punto = rutaPuntos[i]
      const proporcion = rutaPuntos.length > 1 ? i / (rutaPuntos.length - 1) : 0

      try {
        const query =
          `[out:json][timeout:20];` +
          `(` +
          `  node["amenity"="fuel"]["name"~"Repsol",i](around:15000,${punto.latitude},${punto.longitude});` +
          `  way["amenity"="fuel"]["name"~"Repsol",i](around:15000,${punto.latitude},${punto.longitude});` +
          `  node["amenity"="fuel"]["brand"~"Repsol",i](around:15000,${punto.latitude},${punto.longitude});` +
          `  way["amenity"="fuel"]["brand"~"Repsol",i](around:15000,${punto.latitude},${punto.longitude});` +
          `);` +
          `out center;`

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': UA,
          },
          body: `data=${encodeURIComponent(query)}`,
        })

        if (!res.ok) {
          console.warn('[PlacesService] Overpass HTTP error en waypoint:', res.status)
          continue
        }
        const wpText = await res.text()
        if (!wpText.trim().startsWith('{')) {
          console.warn('[PlacesService] Overpass no-JSON en waypoint:', wpText.slice(0, 80))
          continue
        }
        const data = JSON.parse(wpText)
        for (const el of data.elements ?? []) {
          const base = overpassToGrifo(el)
          if (!grifoMap.has(base.id)) {
            const distApprox = Math.round(proporcion * totalDistMetros)
            grifoMap.set(base.id, {
              ...base,
              distanciaMetros: distApprox,
              duracionSegundos: Math.round(proporcion * totalDurSecs),
              distanciaTexto: distApprox > 0 ? mToKm(distApprox) : 'En ruta',
              duracionTexto: totalDurSecs > 0 ? secsToText(Math.round(proporcion * totalDurSecs)) : 'Ver mapa',
            })
          }
        }

        if (i < rutaPuntos.length - 1) {
          await new Promise(r => setTimeout(r, 1000))
        }
      } catch (err) {
        console.error(`[PlacesService] Overpass error en waypoint ${i}:`, err)
      }
    }

    const resultado = Array.from(grifoMap.values()).sort(
      (a, b) => a.distanciaMetros - b.distanciaMetros
    )

    if (resultado.length > 0) {
      await PlacesService.persistirGrifos(resultado)
    } else {
      const grifos = await FirestoreService.getGrifos()
      return grifos.map(g => ({
        ...g,
        distanciaMetros: 0,
        duracionSegundos: 0,
        distanciaTexto: 'Sin datos',
        duracionTexto: secsToText(totalDurSecs),
      }))
    }

    return resultado
  },

  /**
   * Información de ruta (distancia y duración totales) usando OSRM.
   */
  async obtenerInfoRuta(
    origen: LatLng,
    destinoCoords: LatLng
  ): Promise<{ distanciaTexto: string; duracionTexto: string } | null> {
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${origen.longitude},${origen.latitude};` +
        `${destinoCoords.longitude},${destinoCoords.latitude}` +
        `?overview=false`

      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      const data = await res.json()

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0]
        return {
          distanciaTexto: mToKm(Math.round(route.distance)),
          duracionTexto: secsToText(Math.round(route.duration)),
        }
      }
    } catch (err) {
      console.error('[PlacesService] OSRM info ruta error:', err)
    }
    return null
  },
}

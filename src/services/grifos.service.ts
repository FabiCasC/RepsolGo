import type { Grifo } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const GRIFOS_MOCK: Grifo[] = [
  {
    id: '1',
    nombre: 'Repsol Javier Prado Este',
    direccion: 'Av. Javier Prado Este 4200, La Molina',
    latitude: -12.0839,
    longitude: -76.9786,
    precios: [
      { tipo: '90 oct', precio: 16.49 },
      { tipo: '95 oct', precio: 18.29 },
      { tipo: 'Diesel B5', precio: 15.89 },
    ],
    tiempoEspera: '~5 min',
    abierto24h: true,
    distancia: '2.3 km',
    esFavorito: true,
  },
  {
    id: '2',
    nombre: 'Repsol Benavides',
    direccion: 'Av. Benavides 1244, Miraflores',
    latitude: -12.1116,
    longitude: -77.0086,
    precios: [
      { tipo: '90 oct', precio: 16.59 },
      { tipo: '95 oct', precio: 18.39 },
      { tipo: 'Diesel B5', precio: 15.99 },
    ],
    tiempoEspera: '~8 min',
    abierto24h: true,
    distancia: '3.7 km',
    esFavorito: false,
  },
  {
    id: '3',
    nombre: 'Repsol Angamos',
    direccion: 'Av. Angamos Oeste 890, Surquillo',
    latitude: -12.1073,
    longitude: -77.0256,
    precios: [
      { tipo: '90 oct', precio: 16.45 },
      { tipo: '95 oct', precio: 18.25 },
      { tipo: 'Diesel B5', precio: 15.79 },
    ],
    tiempoEspera: '~3 min',
    abierto24h: false,
    distancia: '4.1 km',
    esFavorito: false,
  },
  {
    id: '4',
    nombre: 'Repsol La Marina',
    direccion: 'Av. La Marina 2355, San Miguel',
    latitude: -12.0850,
    longitude: -77.0856,
    precios: [
      { tipo: '90 oct', precio: 16.42 },
      { tipo: '95 oct', precio: 18.22 },
      { tipo: 'Diesel B5', precio: 15.75 },
    ],
    tiempoEspera: '~12 min',
    abierto24h: true,
    distancia: '5.8 km',
    esFavorito: false,
  },
  {
    id: '5',
    nombre: 'Repsol Panamericana Norte',
    direccion: 'Panamericana Norte Km 12, Independencia',
    latitude: -11.9847,
    longitude: -77.0614,
    precios: [
      { tipo: '90 oct', precio: 16.39 },
      { tipo: '95 oct', precio: 18.19 },
      { tipo: 'Diesel B5', precio: 15.72 },
    ],
    tiempoEspera: '~6 min',
    abierto24h: true,
    distancia: '8.2 km',
    esFavorito: false,
  },
]

export const GrifosService = {
  async getGrifos(): Promise<Grifo[]> {
    await delay(400)
    return GRIFOS_MOCK
  },

  async getGrifoById(id: string): Promise<Grifo | undefined> {
    await delay(200)
    return GRIFOS_MOCK.find(g => g.id === id)
  },

  async toggleFavorito(id: string): Promise<Grifo[]> {
    await delay(200)
    return GRIFOS_MOCK.map(g =>
      g.id === id ? { ...g, esFavorito: !g.esFavorito } : g
    )
  },
}

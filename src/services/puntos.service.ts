import type { Punto, Canje } from '../types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface PuntosBalance {
  total: number
  nivel: string
  puntosParaSiguienteNivel: number
  progresoNivel: number
  esteMes: number
  cargas: number
  retosCompletados: number
}

const BALANCE_MOCK: PuntosBalance = {
  total: 4820,
  nivel: 'Oro',
  puntosParaSiguienteNivel: 5000,
  progresoNivel: 0.32,
  esteMes: 320,
  cargas: 8,
  retosCompletados: 2,
}

const HISTORIAL_MOCK: Punto[] = [
  {
    id: '1',
    fecha: '14/10/2026',
    descripcion: 'Carga de combustible',
    cantidad: 90,
    tipo: 'carga',
    grifoNombre: 'Repsol Javier Prado Este',
  },
  {
    id: '2',
    fecha: '12/10/2026',
    descripcion: 'Carga de combustible',
    cantidad: 88,
    tipo: 'carga',
    grifoNombre: 'Repsol Benavides',
  },
  {
    id: '3',
    fecha: '10/10/2026',
    descripcion: 'Boleta escaneada',
    cantidad: 120,
    tipo: 'escaneo',
    grifoNombre: 'Repsol La Marina',
    badge: 'Retroactivo',
  },
  {
    id: '4',
    fecha: '08/10/2026',
    descripcion: 'Bono por reto completado',
    cantidad: 300,
    tipo: 'bonus',
  },
  {
    id: '5',
    fecha: '05/10/2026',
    descripcion: 'Carga de combustible',
    cantidad: 75,
    tipo: 'carga',
    grifoNombre: 'Repsol Angamos',
  },
]

const CANJES_MOCK: Canje[] = [
  {
    id: '1',
    nombre: 'Descuento en combustible',
    descripcion: 'S/5 de descuento en tu próxima carga',
    puntos: 500,
    icono: 'fuel',
    categoria: 'combustible',
  },
  {
    id: '2',
    nombre: 'Tienda Repsol',
    descripcion: 'Vale de S/20 en tienda',
    puntos: 1000,
    icono: 'store',
    categoria: 'tienda',
  },
  {
    id: '3',
    nombre: 'Car wash gratis',
    descripcion: 'Lavado básico sin costo',
    puntos: 800,
    icono: 'car',
    categoria: 'descuento',
  },
  {
    id: '4',
    nombre: 'Gift card S/50',
    descripcion: 'Voucher canjeable en Ripley',
    puntos: 2500,
    icono: 'gift',
    categoria: 'voucher',
  },
]

export const PuntosService = {
  async getBalance(): Promise<PuntosBalance> {
    await delay(400)
    return BALANCE_MOCK
  },

  async getHistorial(): Promise<Punto[]> {
    await delay(400)
    return HISTORIAL_MOCK
  },

  async getCanjes(): Promise<Canje[]> {
    await delay(300)
    return CANJES_MOCK
  },

  async canjear(_canjeId: string, _puntos: number): Promise<{ success: boolean; nuevoBalance: number }> {
    await delay(600)
    return { success: true, nuevoBalance: BALANCE_MOCK.total - 500 }
  },
}

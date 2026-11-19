import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User, Grifo, Reto } from '../types'

export interface CargaData {
  grifoNombre: string
  fecha: string
  litros: string
  monto: string
  combustible: string
  puntos: number
}

export interface CanjeData {
  nombre: string
  puntos: number
  canjeId: string
}

export interface FavoritoData {
  grifoId: string
  nombre: string
  direccion: string
  latitude: number
  longitude: number
}

const RETOS_DEFAULT: Omit<Reto, 'id'>[] = [
  {
    titulo: 'Cargador Constante',
    descripcion: 'Realiza 5 cargas este mes en cualquier grifo Repsol',
    progreso: 0,
    meta: 5,
    puntos: 300,
    xp: 100,
    fechaVencimiento: '31 oct',
    completado: false,
    icono: '⚡',
    color: '#FF8200',
  },
  {
    titulo: 'Madrugador',
    descripcion: 'Carga entre 6 AM y 9 AM durante 3 días',
    progreso: 0,
    meta: 3,
    puntos: 200,
    xp: 75,
    fechaVencimiento: '20 oct',
    completado: false,
    icono: '🌅',
    color: '#F59E0B',
  },
  {
    titulo: 'Explorador',
    descripcion: 'Visita 5 grifos Repsol distintos',
    progreso: 0,
    meta: 5,
    puntos: 250,
    xp: 80,
    fechaVencimiento: '31 oct',
    completado: false,
    icono: '🗺️',
    color: '#3B82F6',
  },
]

const CANJES_DEFAULT = [
  {
    id: 'canje_1',
    nombre: 'Descuento en combustible',
    descripcion: 'S/5 de descuento en tu próxima carga',
    puntos: 500,
    icono: 'fuel',
    categoria: 'combustible' as const,
  },
  {
    id: 'canje_2',
    nombre: 'Tienda Repsol',
    descripcion: 'Vale de S/20 en tienda',
    puntos: 1000,
    icono: 'store',
    categoria: 'tienda' as const,
  },
  {
    id: 'canje_3',
    nombre: 'Car wash gratis',
    descripcion: 'Lavado básico sin costo',
    puntos: 800,
    icono: 'car',
    categoria: 'descuento' as const,
  },
  {
    id: 'canje_4',
    nombre: 'Gift card S/50',
    descripcion: 'Voucher canjeable en Ripley',
    puntos: 2500,
    icono: 'gift',
    categoria: 'voucher' as const,
  },
]

export const FirestoreService = {
  async getUserProfile(uid: string): Promise<Partial<User> | null> {
    const docRef = doc(db, 'users', uid)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    return snap.data() as Partial<User>
  },

  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, { ...data })
  },

  async toggleFavorito(uid: string, grifoId: string, grifo: FavoritoData): Promise<boolean> {
    const favRef = doc(db, 'users', uid, 'favoritos', grifoId)
    const snap = await getDoc(favRef)
    if (snap.exists()) {
      await deleteDoc(favRef)
      return false
    } else {
      await setDoc(favRef, {
        ...grifo,
        savedAt: serverTimestamp(),
      })
      return true
    }
  },

  async getFavoritos(uid: string): Promise<FavoritoData[]> {
    const colRef = collection(db, 'users', uid, 'favoritos')
    const snap = await getDocs(colRef)
    return snap.docs.map(d => ({ ...d.data(), grifoId: d.id } as FavoritoData))
  },

  async isFavorito(uid: string, grifoId: string): Promise<boolean> {
    const favRef = doc(db, 'users', uid, 'favoritos', grifoId)
    const snap = await getDoc(favRef)
    return snap.exists()
  },

  async addCarga(uid: string, cargaData: CargaData): Promise<string> {
    const cargasRef = collection(db, 'users', uid, 'cargas')
    const docRef = await addDoc(cargasRef, {
      ...cargaData,
      createdAt: serverTimestamp(),
    })
    // Update user points
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      puntos: increment(cargaData.puntos),
    })
    return docRef.id
  },

  async getCargas(uid: string): Promise<(CargaData & { id: string })[]> {
    const cargasRef = collection(db, 'users', uid, 'cargas')
    const q = query(cargasRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CargaData & { id: string }))
  },

  async canjearPuntos(uid: string, canje: CanjeData): Promise<void> {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) throw new Error('Usuario no encontrado')
    const userData = userSnap.data()
    if ((userData.puntos ?? 0) < canje.puntos) throw new Error('Puntos insuficientes')

    await updateDoc(userRef, {
      puntos: increment(-canje.puntos),
    })
    const canjesRef = collection(db, 'users', uid, 'canjes')
    await addDoc(canjesRef, {
      ...canje,
      fecha: new Date().toLocaleDateString('es-PE'),
      createdAt: serverTimestamp(),
    })
  },

  async getCanjes(uid: string): Promise<(CanjeData & { id: string; fecha: string })[]> {
    const canjesRef = collection(db, 'users', uid, 'canjes')
    const q = query(canjesRef, orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CanjeData & { id: string; fecha: string })
    )
  },

  async getBalance(uid: string): Promise<{
    total: number
    nivel: string
    cargas: number
    retosCompletados: number
    esteMes: number
    puntosParaSiguienteNivel: number
    progresoNivel: number
  }> {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    const userData = snap.exists() ? snap.data() : {}

    const cargasSnap = await getDocs(collection(db, 'users', uid, 'cargas'))
    const retosSnap = await getDocs(collection(db, 'users', uid, 'retos'))
    const retosCompletados = retosSnap.docs.filter(d => d.data().completado === true).length

    const puntos = userData.puntos ?? 0
    const nivel = userData.nivel ?? 'Bronce'

    const nivelConfig: Record<string, { next: number }> = {
      Bronce: { next: 1000 },
      Plata: { next: 3000 },
      Oro: { next: 5000 },
      Platino: { next: 10000 },
      Diamante: { next: 20000 },
    }
    const nextLevel = nivelConfig[nivel]?.next ?? 5000
    const progresoNivel = Math.min(puntos / nextLevel, 1)

    return {
      total: puntos,
      nivel,
      cargas: cargasSnap.size,
      retosCompletados,
      esteMes: 0,
      puntosParaSiguienteNivel: nextLevel,
      progresoNivel,
    }
  },

  async updateRetoProgreso(uid: string, retoId: string, progreso: number): Promise<void> {
    const retoRef = doc(db, 'users', uid, 'retos', retoId)
    const snap = await getDoc(retoRef)
    if (!snap.exists()) return
    const retoData = snap.data()
    const completado = progreso >= (retoData.meta ?? 1)
    await updateDoc(retoRef, { progreso, completado })
  },

  async seedRetosIniciales(uid: string): Promise<void> {
    const retosRef = collection(db, 'users', uid, 'retos')
    const snap = await getDocs(retosRef)
    if (snap.size > 0) return
    for (const reto of RETOS_DEFAULT) {
      await addDoc(retosRef, { ...reto })
    }
  },

  async getRetos(uid: string): Promise<(Reto & { firestoreId: string })[]> {
    const retosRef = collection(db, 'users', uid, 'retos')
    const snap = await getDocs(retosRef)
    return snap.docs.map(d => ({ firestoreId: d.id, id: d.id, ...d.data() } as Reto & { firestoreId: string }))
  },

  async seedCanjesDisponibles(): Promise<void> {
    for (const canje of CANJES_DEFAULT) {
      const canjeRef = doc(db, 'canjes', canje.id)
      const snap = await getDoc(canjeRef)
      if (!snap.exists()) {
        await setDoc(canjeRef, canje)
      }
    }
  },

  async getCanjesDisponibles(): Promise<typeof CANJES_DEFAULT> {
    const snap = await getDocs(collection(db, 'canjes'))
    if (snap.empty) {
      await this.seedCanjesDisponibles()
      return CANJES_DEFAULT
    }
    return snap.docs.map(d => d.data() as (typeof CANJES_DEFAULT)[0])
  },

  async actualizarNivel(uid: string, puntos: number): Promise<void> {
    let nivel = 'Bronce'
    if (puntos >= 10000) nivel = 'Diamante'
    else if (puntos >= 5000) nivel = 'Platino'
    else if (puntos >= 3000) nivel = 'Oro'
    else if (puntos >= 1000) nivel = 'Plata'
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { nivel })
  },
}

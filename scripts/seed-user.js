/**
 * seed_firestore.js
 * Llena Firestore con datos completos para el usuario de Fabiana (fabiana.castroc22@gmail.com)
 * Colecciones: users/{uid}, users/{uid}/cargas, users/{uid}/retos, users/{uid}/favoritos, canjes
 *
 * Uso: node seed_firestore.js
 */

const { initializeApp } = require('firebase/app')
const {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  Timestamp,
  writeBatch,
} = require('firebase/firestore')

const firebaseConfig = {
  apiKey: 'AIzaSyAV3jVDoKhRbzPzVmSHvR-YrofDefSCz1k',
  authDomain: 'repsol-go-69b14.firebaseapp.com',
  projectId: 'repsol-go-69b14',
  storageBucket: 'repsol-go-69b14.firebasestorage.app',
  messagingSenderId: '448913502313',
  appId: '1:448913502313:android:13c9b6e6243041669bb2f8',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// UID del usuario de Fabiana — se detecta del argumento o se usa el que está en auth
// Para obtener el UID real: en la app loguea y anota el uid de la consola,
// o pásalo como: node seed_firestore.js <UID>
const UID = process.argv[2]
if (!UID) {
  console.error('❌ Debes pasar el UID del usuario: node seed_firestore.js <UID>')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return Timestamp.fromDate(d)
}

function formatDate(d) {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Datos ────────────────────────────────────────────────────────────────────

const CARGAS = [
  {
    grifoNombre: 'Repsol Javier Prado Este',
    fecha: formatDate(new Date(Date.now() - 2 * 86400000)),
    litros: '30',
    monto: 'S/489.90',
    combustible: '95 oct',
    puntos: 180,
    createdAt: daysAgo(2),
  },
  {
    grifoNombre: 'Repsol Surco',
    fecha: formatDate(new Date(Date.now() - 8 * 86400000)),
    litros: '25',
    monto: 'S/408.25',
    combustible: '90 oct',
    puntos: 150,
    createdAt: daysAgo(8),
  },
  {
    grifoNombre: 'Repsol San Isidro',
    fecha: formatDate(new Date(Date.now() - 14 * 86400000)),
    litros: '28',
    monto: 'S/512.40',
    combustible: '95 oct',
    puntos: 200,
    createdAt: daysAgo(14),
  },
  {
    grifoNombre: 'Repsol La Molina',
    fecha: formatDate(new Date(Date.now() - 22 * 86400000)),
    litros: '20',
    monto: 'S/326.60',
    combustible: 'Diesel B5',
    puntos: 100,
    createdAt: daysAgo(22),
  },
  {
    grifoNombre: 'Repsol Miraflores',
    fecha: formatDate(new Date(Date.now() - 30 * 86400000)),
    litros: '35',
    monto: 'S/571.75',
    combustible: '90 oct',
    puntos: 210,
    createdAt: daysAgo(30),
  },
  {
    grifoNombre: 'Repsol San Borja',
    fecha: formatDate(new Date(Date.now() - 45 * 86400000)),
    litros: '22',
    monto: 'S/359.26',
    combustible: '95 oct',
    puntos: 130,
    createdAt: daysAgo(45),
  },
  {
    grifoNombre: 'Repsol Javier Prado Este',
    fecha: formatDate(new Date(Date.now() - 60 * 86400000)),
    litros: '32',
    monto: 'S/522.08',
    combustible: '90 oct',
    puntos: 190,
    createdAt: daysAgo(60),
  },
  {
    grifoNombre: 'Repsol Chorrillos',
    fecha: formatDate(new Date(Date.now() - 75 * 86400000)),
    litros: '18',
    monto: 'S/293.94',
    combustible: 'Diesel B5',
    puntos: 90,
    createdAt: daysAgo(75),
  },
]

const RETOS = [
  {
    titulo: 'Cargador Constante',
    descripcion: 'Realiza 5 cargas este mes en cualquier grifo Repsol',
    progreso: 5,
    meta: 5,
    puntos: 300,
    xp: 100,
    fechaVencimiento: '30 nov',
    completado: true,
    icono: 'bolt',
    color: '#FF8200',
  },
  {
    titulo: 'Madrugador',
    descripcion: 'Carga entre 6 AM y 9 AM durante 3 días',
    progreso: 3,
    meta: 3,
    puntos: 200,
    xp: 75,
    fechaVencimiento: '30 nov',
    completado: true,
    icono: 'sunrise',
    color: '#F59E0B',
  },
  {
    titulo: 'Explorador',
    descripcion: 'Visita 5 grifos Repsol distintos',
    progreso: 5,
    meta: 5,
    puntos: 250,
    xp: 80,
    fechaVencimiento: '30 nov',
    completado: true,
    icono: 'map',
    color: '#3B82F6',
  },
  {
    titulo: 'Viajero Repsol',
    descripcion: 'Realiza una carga en 3 provincias distintas',
    progreso: 1,
    meta: 3,
    puntos: 400,
    xp: 150,
    fechaVencimiento: '31 dic',
    completado: false,
    icono: 'car',
    color: '#10B981',
  },
  {
    titulo: 'Cliente Fiel',
    descripcion: 'Realiza 10 cargas en Repsol en el mes',
    progreso: 8,
    meta: 10,
    puntos: 500,
    xp: 200,
    fechaVencimiento: '30 nov',
    completado: false,
    icono: 'star',
    color: '#8B5CF6',
  },
]

const FAVORITOS = [
  {
    grifoId: 'repsol_javier_prado',
    nombre: 'Repsol Javier Prado Este',
    direccion: 'Av. Javier Prado Este 4200, La Molina',
    latitude: -12.0839,
    longitude: -76.9786,
    savedAt: daysAgo(5),
  },
  {
    grifoId: 'repsol_san_isidro',
    nombre: 'Repsol San Isidro',
    direccion: 'Av. Javier Prado Oeste 2000, San Isidro',
    latitude: -12.1066,
    longitude: -77.0383,
    savedAt: daysAgo(10),
  },
]

const CANJES_DISPONIBLES = [
  {
    id: 'canje_1',
    nombre: 'Descuento en combustible',
    descripcion: 'S/5 de descuento en tu próxima carga',
    puntos: 500,
    icono: 'fuel',
    categoria: 'combustible',
  },
  {
    id: 'canje_2',
    nombre: 'Tienda Repsol',
    descripcion: 'Vale de S/20 en tienda',
    puntos: 1000,
    icono: 'store',
    categoria: 'tienda',
  },
  {
    id: 'canje_3',
    nombre: 'Car wash gratis',
    descripcion: 'Lavado básico sin costo',
    puntos: 800,
    icono: 'car',
    categoria: 'descuento',
  },
  {
    id: 'canje_4',
    nombre: 'Gift card S/50',
    descripcion: 'Voucher canjeable en Ripley',
    puntos: 2500,
    icono: 'gift',
    categoria: 'voucher',
  },
  {
    id: 'canje_5',
    nombre: 'Mes gratis Spotify',
    descripcion: 'Acceso Premium por 1 mes',
    puntos: 1500,
    icono: 'music',
    categoria: 'entretenimiento',
  },
]

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🔥 Iniciando seed en Firestore para UID: ${UID}\n`)

  // 1. Perfil de usuario
  const totalPuntos = CARGAS.reduce((acc, c) => acc + c.puntos, 0) + 300 + 200 + 250 // cargas + retos completados
  console.log(`📋 Creando perfil de usuario (${totalPuntos} puntos)...`)
  await setDoc(doc(db, 'users', UID), {
    nombre: 'Fabiana Castro',
    email: 'fabiana.castroc22@gmail.com',
    rol: 'cliente',
    puntos: totalPuntos,
    nivel: totalPuntos >= 3000 ? 'Oro' : totalPuntos >= 1000 ? 'Plata' : 'Bronce',
    createdAt: daysAgo(90),
    updatedAt: Timestamp.now(),
  }, { merge: true })
  console.log(`   ✅ Perfil creado — ${totalPuntos} puntos, nivel ${totalPuntos >= 3000 ? 'Oro' : 'Plata'}`)

  // 2. Cargas
  console.log(`\n⛽ Creando ${CARGAS.length} cargas...`)
  const cargasRef = collection(db, 'users', UID, 'cargas')
  const existingCargas = await getDocs(cargasRef)
  if (existingCargas.size > 0) {
    console.log(`   ⚠️  Ya hay ${existingCargas.size} cargas — se agregan las nuevas igual`)
  }
  for (const carga of CARGAS) {
    await addDoc(cargasRef, carga)
    console.log(`   ✅ ${carga.grifoNombre} — ${carga.litros}L — ${carga.puntos} pts`)
  }

  // 3. Retos
  console.log(`\n🏆 Creando ${RETOS.length} retos...`)
  const retosRef = collection(db, 'users', UID, 'retos')
  const existingRetos = await getDocs(retosRef)
  if (existingRetos.size === 0) {
    for (const reto of RETOS) {
      await addDoc(retosRef, reto)
      console.log(`   ✅ ${reto.titulo} — completado: ${reto.completado}`)
    }
  } else {
    console.log(`   ⚠️  Ya hay ${existingRetos.size} retos — no se duplican`)
  }

  // 4. Favoritos
  console.log(`\n❤️  Creando ${FAVORITOS.length} favoritos...`)
  for (const fav of FAVORITOS) {
    await setDoc(doc(db, 'users', UID, 'favoritos', fav.grifoId), fav, { merge: true })
    console.log(`   ✅ ${fav.nombre}`)
  }

  // 5. Canjes disponibles (colección global)
  console.log(`\n🎁 Creando ${CANJES_DISPONIBLES.length} canjes disponibles...`)
  for (const canje of CANJES_DISPONIBLES) {
    await setDoc(doc(db, 'canjes', canje.id), canje, { merge: true })
    console.log(`   ✅ ${canje.nombre} — ${canje.puntos} pts`)
  }

  // 6. Resumen
  console.log(`\n✨ Seed completado!\n`)
  console.log(`   👤 Usuario:   Fabiana Castro`)
  console.log(`   🔑 UID:        ${UID}`)
  console.log(`   💰 Puntos:    ${totalPuntos}`)
  console.log(`   ⛽ Cargas:    ${CARGAS.length}`)
  console.log(`   🏆 Retos:     ${RETOS.filter(r => r.completado).length} completados / ${RETOS.length} total`)
  console.log(`   ❤️  Favoritos: ${FAVORITOS.length}`)
  console.log(`   🎁 Canjes:    ${CANJES_DISPONIBLES.length} disponibles\n`)

  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})

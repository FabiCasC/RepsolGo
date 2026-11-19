// seed_firestore.js — usa Firestore REST API con API key del cliente
// Ejecutar: node seed_firestore.js

const https = require('https')

const PROJECT_ID = 'repsol-go-69b14'
const API_KEY = 'AIzaSyAV3jVDoKhRbzPzVmSHvR-YrofDefSCz1k'
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'string') return { stringValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function toFirestoreDoc(obj) {
  const fields = {}
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v)
  return { fields }
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${path}?key=${API_KEY}`
    const data = body ? JSON.stringify(body) : null
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    }
    const req = https.request(url, options, res => {
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => {
        const parsed = JSON.parse(body)
        if (res.statusCode >= 400) reject(Object.assign(new Error(parsed.error?.message || body), { status: res.statusCode, body: parsed }))
        else resolve(parsed)
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function upsert(collection, docId, data) {
  // PATCH con updateMask crea o sobreescribe
  const fields = toFirestoreDoc(data).fields
  const fieldPaths = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}&${fieldPaths}`
    const body = JSON.stringify({ fields })
    const req = https.request(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        const p = JSON.parse(d)
        if (res.statusCode >= 400) reject(Object.assign(new Error(p.error?.message || d), { status: res.statusCode }))
        else resolve(p)
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const GRIFOS = [
  { id: 'grifo_javier_prado', nombre: 'Repsol Javier Prado Este', direccion: 'Av. Javier Prado Este 4200, Santiago de Surco', lat: -12.0808, lng: -76.9681, horario: '24 horas', servicios: ['Gasolina 90','Gasolina 95','Gasolina 97','Diesel B5','GLP'], telefono: '01-234-5678', favorito: false, rating: 4.5 },
  { id: 'grifo_benavides', nombre: 'Repsol Benavides', direccion: 'Av. Benavides 1800, Miraflores', lat: -12.1328, lng: -77.0169, horario: '24 horas', servicios: ['Gasolina 90','Gasolina 95','Diesel B5','GLP'], telefono: '01-234-5679', favorito: false, rating: 4.3 },
  { id: 'grifo_angamos', nombre: 'Repsol Angamos', direccion: 'Av. Angamos Este 1200, Surquillo', lat: -12.1105, lng: -77.0003, horario: '6am - 11pm', servicios: ['Gasolina 90','Gasolina 95','Diesel B5'], telefono: '01-234-5680', favorito: false, rating: 4.1 },
  { id: 'grifo_la_marina', nombre: 'Repsol La Marina', direccion: 'Av. La Marina 2500, San Miguel', lat: -12.0788, lng: -77.0875, horario: '24 horas', servicios: ['Gasolina 90','Gasolina 95','Gasolina 97','Diesel B5','GLP','GNV'], telefono: '01-234-5681', favorito: false, rating: 4.6 },
  { id: 'grifo_panamericana_norte', nombre: 'Repsol Panamericana Norte', direccion: 'Panamericana Norte Km 12, Independencia', lat: -11.9876, lng: -77.0634, horario: '24 horas', servicios: ['Gasolina 90','Gasolina 95','Diesel B5','GLP'], telefono: '01-234-5682', favorito: false, rating: 4.0 },
]

const CANJES = [
  { id: 'canje_cafe', nombre: 'Café gratis', descripcion: 'Un café de cualquier tamaño en tiendas Repsol participantes', puntos: 500, icono: '☕', categoria: 'Alimentación', disponible: true, stock: 100 },
  { id: 'canje_descuento_5', nombre: 'S/ 5 de descuento', descripcion: 'Descuento directo en tu próxima carga de combustible', puntos: 1000, icono: '🏷️', categoria: 'Combustible', disponible: true, stock: 50 },
  { id: 'canje_descuento_10', nombre: 'S/ 10 de descuento', descripcion: 'Descuento directo en tu próxima carga de combustible', puntos: 2000, icono: '💰', categoria: 'Combustible', disponible: true, stock: 30 },
  { id: 'canje_lavado', nombre: 'Lavado de auto', descripcion: 'Lavado exterior completo en grifos con autolavado', puntos: 3000, icono: '🚗', categoria: 'Servicios', disponible: true, stock: 20 },
  { id: 'canje_aceite', nombre: 'Cambio de aceite', descripcion: 'Cambio de aceite estándar en grifos con taller', puntos: 5000, icono: '🔧', categoria: 'Mantenimiento', disponible: true, stock: 10 },
  { id: 'canje_snack', nombre: 'Snack gratis', descripcion: 'Un snack a elección en la tienda Repsol', puntos: 300, icono: '🍫', categoria: 'Alimentación', disponible: true, stock: 200 },
]

async function seed() {
  console.log('🔥 Firestore REST API — proyecto:', PROJECT_ID)

  console.log('\n📍 Creando grifos...')
  for (const g of GRIFOS) {
    const { id, ...data } = g
    await upsert('grifos', id, data)
    console.log('  ✓', g.nombre)
  }

  console.log('\n🎁 Creando canjes...')
  for (const c of CANJES) {
    const { id, ...data } = c
    await upsert('canjes', id, data)
    console.log('  ✓', c.nombre, '(' + c.puntos + ' pts)')
  }

  console.log('\n✅ Seed completado! ' + GRIFOS.length + ' grifos, ' + CANJES.length + ' canjes')
}

seed().catch(err => {
  console.error('❌ Error:', err.message)
  if (err.status === 403) {
    console.error('\n→ REGLAS BLOQUEANDO. Ve a Firebase Console → Firestore → Rules')
    console.error('  Pega esto y publica:')
    console.error('')
    console.error('  rules_version = "2";')
    console.error('  service cloud.firestore {')
    console.error('    match /databases/{database}/documents {')
    console.error('      match /{document=**} {')
    console.error('        allow read, write: if true;')
    console.error('      }')
    console.error('    }')
    console.error('  }')
    console.error('')
    console.error('  Luego vuelve a correr: node seed_firestore.js')
    console.error('  IMPORTANTE: después de seedear, restaura las reglas correctas.')
  }
  process.exit(1)
})

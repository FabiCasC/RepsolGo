# RepsolGo 🔵

App móvil Android para Repsol Perú — Proyecto Final UTP (APF2).

## Stack

- **React Native** + **Expo SDK 57** + **Expo Router v4** (rutas tipadas)
- **TypeScript** + **Zustand** (estado global) + **SecureStore** (sesión y cuentas)
- **expo-local-authentication** (biometría)
- **react-native-maps** (mapa de grifos / puntos de venta)

## Módulos implementados (APF2)

### 2.1 Autenticación
- Login con validación de cuentas guardadas en SecureStore
- Registro con nombre, email, teléfono, contraseña y rol
- Recuperación de contraseña: valida email → código OTP (mock: `123456`) → nueva contraseña
- Cambio de contraseña desde Perfil
- Sesión persistente con token en SecureStore (sobrevive al reinicio)
- Biometría (huella/rostro) activable desde Perfil

### 2.2 Perfil
- Ver y editar nombre, teléfono y foto (ImagePicker)
- Preferencias de notificaciones (push y email)
- Los cambios persisten en SecureStore al cerrar sesión

### 2.3 Delivery de GLP (Módulo principal)
- Catálogo de balones: 5, 10, 15 y 45 kg (máx. 5 por tipo)
- Checkout: dirección, referencia y pago (Yape, Plin, Tarjeta simulado)
- Seguimiento: pendiente → aceptado → en camino → entregado (botón "Simular")
- Historial de pedidos en "Mis pedidos"

### Otros módulos
- **Mapa**: grifos de Lima con marcadores
- **Puntos**: balance, nivel Oro, canje y historial
- **Escanear**: simulación de OCR de boleta
- **Retos**: XP, retos activos, badges CO₂ (accesible desde Perfil)

## Cuenta de prueba

```
Email:    fabiana.castroc22@gmail.com
Password: 123456
Código de recuperación: 123456
```

## Configuración

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env desde la plantilla
cp .env.example .env
# Editar .env y poner tu GOOGLE_MAPS_API_KEY

# 3. Arrancar
npx expo start -c
```

## Notas de seguridad

- La API key de Google Maps va en `.env` (no se sube al repo)
- Las contraseñas se guardan en texto plano en SecureStore (solo para prototipo/mock)
- Para producción: restringir la key en Google Cloud por paquete y SHA-1

## Tabs

| Tab | Ruta |
|-----|------|
| 🗺️ Mapa | `/(app)/mapa` |
| ⭐ Puntos | `/(app)/puntos` |
| 📷 Escanear | `/(app)/escanear` |
| 🛵 Delivery | `/(app)/delivery` |
| 👤 Perfil | `/(app)/perfil` |

> Retos está oculto del tab bar — se accede desde Perfil → "Retos y gamificación"

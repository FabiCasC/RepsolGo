import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/store/auth.store';

// ── Icons ──────────────────────────────────────────────────────────────────────

function IcoMapa({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1="9" y1="3" x2="9" y2="18" stroke={color} strokeWidth={1.8} />
      <Line x1="15" y1="6" x2="15" y2="21" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoPuntos({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IcoCamera({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoViaje({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} />
      <Polyline points="12,6 12,12 16,14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IcoGamepad({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1="9" y1="12" x2="13" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="11" y1="10" x2="11" y2="14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="17" cy="11" r="1" fill={color} />
      <Circle cx="17" cy="13" r="1" fill={color} />
    </Svg>
  );
}

function IcoPerfil({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IcoAlerta({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IcoTurno({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={1.8} />
      <Path d="M9 16l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── FAB wrapper ────────────────────────────────────────────────────────────────

function FabIcon() {
  return (
    <View style={styles.fabWrap}>
      <View style={styles.fabBtn}>
        <IcoCamera color="#fff" size={26} />
      </View>
    </View>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

const TAB_OPTIONS = {
  headerShown: false,
  tabBarActiveTintColor: Colors.orange,
  tabBarInactiveTintColor: Colors.textMuted,
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
};

export default function AppLayout() {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token]);

  if (!token) return null;

  const isOperario = user?.role === 'operario';

  if (isOperario) {
    // ── Operario: Escanear | Incidencias | Turno | Perfil ──
    return (
      <Tabs screenOptions={TAB_OPTIONS}>
        <Tabs.Screen
          name="escanear"
          options={{
            title: 'Escanear',
            tabBarIcon: ({ color }) => <FabIcon />,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="incidencias"
          options={{
            title: 'Incidencias',
            tabBarIcon: ({ color }) => <IcoAlerta color={color} />,
          }}
        />
        <Tabs.Screen
          name="turno"
          options={{
            title: 'Turno',
            tabBarIcon: ({ color }) => <IcoTurno color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IcoPerfil color={color} />,
          }}
        />
        {/* Ocultar todo lo que no es del operario */}
        <Tabs.Screen name="mapa" options={{ href: null }} />
        <Tabs.Screen name="puntos" options={{ href: null }} />
        <Tabs.Screen name="viaje" options={{ href: null }} />
        <Tabs.Screen name="gamificacion" options={{ href: null }} />
        <Tabs.Screen name="delivery" options={{ href: null }} />
        <Tabs.Screen name="retos" options={{ href: null }} />
        <Tabs.Screen name="perfil/editar" options={{ href: null }} />
        <Tabs.Screen name="perfil/cambiar-password" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── Cliente: Mapa | Puntos | Escanear(FAB) | Viaje | Gamificación | Perfil ──
  return (
    <Tabs screenOptions={TAB_OPTIONS}>
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <IcoMapa color={color} />,
        }}
      />
      <Tabs.Screen
        name="puntos"
        options={{
          title: 'Puntos',
          tabBarIcon: ({ color }) => <IcoPuntos color={color} />,
        }}
      />
      <Tabs.Screen
        name="escanear"
        options={{
          title: '',
          tabBarIcon: () => <FabIcon />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="viaje"
        options={{
          title: 'Viaje',
          tabBarIcon: ({ color }) => <IcoViaje color={color} />,
        }}
      />
      <Tabs.Screen
        name="gamificacion"
        options={{
          title: 'Logros',
          tabBarIcon: ({ color }) => <IcoGamepad color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IcoPerfil color={color} />,
        }}
      />
      {/* Ocultar todo lo que no es del cliente */}
      <Tabs.Screen name="delivery" options={{ href: null }} />
      <Tabs.Screen name="retos" options={{ href: null }} />
      <Tabs.Screen name="incidencias" options={{ href: null }} />
      <Tabs.Screen name="turno" options={{ href: null }} />
      <Tabs.Screen name="perfil/editar" options={{ href: null }} />
      <Tabs.Screen name="perfil/cambiar-password" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

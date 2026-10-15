import { Tabs, router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/store/auth.store';

// ── Icon components ────────────────────────────────────────────────────────────

function IconMapa({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Line x1="9" y1="3" x2="9" y2="18" stroke={color} strokeWidth={1.8} />
      <Line x1="15" y1="6" x2="15" y2="21" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IconPuntos({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconCamera({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IconDelivery({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Rect x="9" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="21" r="1" stroke={color} strokeWidth={1.8} />
      <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IconPerfil({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const token = useAuthStore(s => s.token);
  if (!token) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <Tabs
      screenOptions={{
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <IconMapa color={color} />,
        }}
      />
      <Tabs.Screen
        name="puntos"
        options={{
          title: 'Puntos',
          tabBarIcon: ({ color }) => <IconPuntos color={color} />,
        }}
      />
      <Tabs.Screen
        name="escanear"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.fabWrap}>
              <View style={styles.fabBtn}>
                <IconCamera color="#fff" size={26} />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          title: 'Delivery',
          tabBarIcon: ({ color }) => <IconDelivery color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconPerfil color={color} />,
        }}
      />
      {/* Tabs ocultos */}
      <Tabs.Screen name="retos" options={{ href: null }} />
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

import { Tabs, router } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/store/auth.store';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    mapa: '🗺️', puntos: '⭐', escanear: '📷', delivery: '🛵', perfil: '👤',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[focused && { transform: [{ scale: 1.1 }] }]}>
        <View style={{ opacity: focused ? 1 : 0.55, fontSize: 22 } as any}>
          {/* Icon rendered as emoji for simplicity */}
        </View>
      </View>
    </View>
  );
}

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
        options={{ title: 'Mapa', tabBarIcon: ({ color }) => <TabBarIcon emoji="🗺️" color={color} /> }}
      />
      <Tabs.Screen
        name="puntos"
        options={{ title: 'Puntos', tabBarIcon: ({ color }) => <TabBarIcon emoji="⭐" color={color} /> }}
      />
      <Tabs.Screen
        name="escanear"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ focused }) => (
            <View style={styles.fabWrap}>
              <View style={styles.fabBtn}>
                <TabBarIcon emoji="📷" color="#fff" />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{ title: 'Delivery', tabBarIcon: ({ color }) => <TabBarIcon emoji="🛵" color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <TabBarIcon emoji="👤" color={color} /> }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="retos" options={{ href: null }} />
    </Tabs>
  );
}

function TabBarIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
      <View style={{ opacity: color === Colors.orange ? 1 : 0.6 }}>
        {/* Text component for emoji */}
        <View>
          <TabEmoji emoji={emoji} />
        </View>
      </View>
    </View>
  );
}

function TabEmoji({ emoji }: { emoji: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

const styles = StyleSheet.create({
  fabWrap: { alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  fabBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});

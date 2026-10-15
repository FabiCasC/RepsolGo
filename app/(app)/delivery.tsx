import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';

type Balon = { id: string; kg: number; price: number; desc: string };
type OrderStatus = 'pendiente' | 'aceptado' | 'en_camino' | 'entregado';

interface Order {
  id: string;
  items: { balon: Balon; qty: number }[];
  address: string;
  ref: string;
  payment: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

const BALONES: Balon[] = [
  { id: 'b5', kg: 5, price: 28, desc: 'Ideal para uso doméstico liviano' },
  { id: 'b10', kg: 10, price: 48, desc: 'El más popular en hogares' },
  { id: 'b15', kg: 15, price: 68, desc: 'Para familias numerosas' },
  { id: 'b45', kg: 45, price: 185, desc: 'Uso industrial o comercial' },
];

const PAYMENTS = ['Yape', 'Plin', 'Tarjeta'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  aceptado: '✅ Aceptado',
  en_camino: '🛵 En camino',
  entregado: '📦 Entregado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: '#F59E0B',
  aceptado: '#3B82F6',
  en_camino: Colors.orange,
  entregado: Colors.green,
};

export default function DeliveryScreen() {
  const [tab, setTab] = useState<'catalogo' | 'pedido' | 'historial'>('catalogo');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [address, setAddress] = useState('');
  const [ref, setRef] = useState('');
  const [payment, setPayment] = useState('Yape');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);

  function addToCart(id: string, delta: number) {
    setCart(c => {
      const cur = c[id] ?? 0;
      const next = Math.max(0, Math.min(5, cur + delta));
      return { ...c, [id]: next };
    });
  }

  const cartItems = BALONES.filter(b => (cart[b.id] ?? 0) > 0).map(b => ({ balon: b, qty: cart[b.id] }));
  const total = cartItems.reduce((s, i) => s + i.balon.price * i.qty, 0);

  function handleCheckout() {
    if (!address.trim()) { Alert.alert('Error', 'Ingresa tu dirección'); return; }
    if (cartItems.length === 0) { Alert.alert('Error', 'Selecciona al menos un producto'); return; }
    const order: Order = {
      id: Date.now().toString(),
      items: cartItems,
      address: address.trim(),
      ref: ref.trim(),
      payment,
      total,
      status: 'pendiente',
      createdAt: new Date(),
    };
    setOrders(prev => [order, ...prev]);
    setCart({});
    setAddress('');
    setRef('');
    setTrackOrder(order);
    setTab('historial');
    Alert.alert('¡Pedido realizado!', 'Tu pedido fue registrado correctamente.', [{ text: 'Ver pedido' }]);
  }

  function simulateNext(order: Order) {
    const flow: OrderStatus[] = ['pendiente', 'aceptado', 'en_camino', 'entregado'];
    const idx = flow.indexOf(order.status);
    if (idx >= flow.length - 1) return;
    const next = flow[idx + 1];
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
    setTrackOrder(prev => prev?.id === order.id ? { ...prev, status: next } : prev);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛵 Delivery GLP</Text>
        <Text style={styles.headerSub}>Balones de gas a domicilio</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['catalogo', 'pedido', 'historial'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'catalogo' ? 'Catálogo' : t === 'pedido' ? `Pedido${total > 0 ? ` (S/${total})` : ''}` : `Mis pedidos${orders.length > 0 ? ` (${orders.length})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* CATÁLOGO */}
        {tab === 'catalogo' && (
          <>
            <Text style={styles.sectionTitle}>Selecciona tu balón</Text>
            {BALONES.map(b => (
              <View key={b.id} style={styles.productCard}>
                <View style={styles.productIcon}>
                  <Text style={{ fontSize: 32 }}>🔵</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>Balón {b.kg} kg</Text>
                  <Text style={styles.productDesc}>{b.desc}</Text>
                  <Text style={styles.productPrice}>S/ {b.price}.00</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(b.id, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{cart[b.id] ?? 0}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(b.id, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {total > 0 && (
              <TouchableOpacity style={styles.btnOrange} onPress={() => setTab('pedido')}>
                <Text style={styles.btnText}>Continuar — S/ {total}</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* PEDIDO / CHECKOUT */}
        {tab === 'pedido' && (
          <>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>
            {cartItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No hay productos seleccionados</Text>
                <TouchableOpacity onPress={() => setTab('catalogo')}>
                  <Text style={styles.linkText}>Ir al catálogo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cartItems.map(({ balon, qty }) => (
                  <View key={balon.id} style={styles.cartRow}>
                    <Text style={styles.cartName}>Balón {balon.kg} kg × {qty}</Text>
                    <Text style={styles.cartPrice}>S/ {balon.price * qty}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>S/ {total}</Text>
                </View>

                <Text style={styles.label}>Dirección de entrega</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Av. Ejemplo 123, Miraflores"
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.label}>Referencia (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={ref}
                  onChangeText={setRef}
                  placeholder="Cerca al semáforo"
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.label}>Método de pago</Text>
                <View style={styles.payRow}>
                  {PAYMENTS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.payChip, payment === p && styles.payChipActive]}
                      onPress={() => setPayment(p)}
                    >
                      <Text style={[styles.payLabel, payment === p && styles.payLabelActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.btnOrange} onPress={handleCheckout}>
                  <Text style={styles.btnText}>Confirmar pedido</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <>
            <Text style={styles.sectionTitle}>Mis pedidos</Text>
            {orders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 40, textAlign: 'center' }}>📦</Text>
                <Text style={styles.emptyText}>Aún no tienes pedidos</Text>
              </View>
            ) : (
              orders.map(order => (
                <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => setTrackOrder(order)}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Pedido #{order.id.slice(-4)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                        {STATUS_LABELS[order.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderDetail}>
                    {order.items.map(i => `Balón ${i.balon.kg}kg ×${i.qty}`).join(', ')}
                  </Text>
                  <Text style={styles.orderDetail}>S/ {order.total} · {order.payment}</Text>
                  <Text style={styles.orderDate}>{order.address}</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* TRACKING MODAL */}
      <Modal visible={!!trackOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seguimiento del pedido</Text>
            {trackOrder && (
              <>
                {(['pendiente', 'aceptado', 'en_camino', 'entregado'] as OrderStatus[]).map((s, i) => {
                  const reached = ['pendiente', 'aceptado', 'en_camino', 'entregado'].indexOf(trackOrder.status) >= i;
                  return (
                    <View key={s} style={styles.stepRow}>
                      <View style={[styles.stepDot, reached && styles.stepDotActive]} />
                      <Text style={[styles.stepLabel, reached && styles.stepLabelActive]}>
                        {STATUS_LABELS[s]}
                      </Text>
                    </View>
                  );
                })}
                {trackOrder.status !== 'entregado' && (
                  <TouchableOpacity style={[styles.btnOrange, { marginTop: 20 }]} onPress={() => simulateNext(trackOrder)}>
                    <Text style={styles.btnText}>Simular siguiente estado</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity style={styles.btnClose} onPress={() => setTrackOrder(null)}>
              <Text style={styles.btnCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { backgroundColor: Colors.navy, padding: 20, paddingTop: 8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.orange },
  tabLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: Colors.orange },
  body: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.navy, marginBottom: 12 },
  productCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
  },
  productIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  productDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: '700', color: Colors.orange, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  qtyBtnText: { fontSize: 18, color: Colors.navy, fontWeight: '700' },
  qtyVal: { fontSize: 16, fontWeight: '700', color: Colors.navy, minWidth: 24, textAlign: 'center' },
  btnOrange: { backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cartName: { fontSize: 14, color: Colors.textPrimary },
  cartPrice: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.navy },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.orange },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    color: Colors.textPrimary, backgroundColor: Colors.surface,
  },
  payRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 4 },
  payChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center',
  },
  payChipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  payLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  payLabelActive: { color: '#fff' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  orderDate: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, color: Colors.textMuted, marginTop: 8 },
  linkText: { color: Colors.orange, fontWeight: '700', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.navy, marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.border, marginRight: 12 },
  stepDotActive: { backgroundColor: Colors.orange },
  stepLabel: { fontSize: 15, color: Colors.textMuted },
  stepLabelActive: { color: Colors.textPrimary, fontWeight: '600' },
  btnClose: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
  btnCloseText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
});

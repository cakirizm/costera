import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWaiter } from "../../../src/lib/waiter-auth";
import {
  addLines,
  bootstrap,
  clientId,
  getOrder,
  money,
  sendToKitchen,
  type WaiterCategory,
  type WaiterOrder,
  type WaiterProduct,
} from "../../../src/lib/waiter";
import { colors, spacing } from "../../../src/lib/theme";

/**
 * The ticket. Products on top, what has been rung underneath, and one button to
 * fire it at the kitchen. No payment: the fiscal receipt comes from the till, so
 * a phone that offered to take money would be lying about what it can do.
 */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const waiter = useWaiter();
  const router = useRouter();
  const token = waiter.status === "ready" ? waiter.token : null;
  const currency = waiter.status === "ready" ? waiter.session.venue.currency : "TRY";

  const [order, setOrder] = useState<WaiterOrder | null>(null);
  const [categories, setCategories] = useState<WaiterCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sheet, setSheet] = useState<WaiterProduct | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !id) return;
    const [orderResult, menuResult] = await Promise.all([getOrder(token, id), bootstrap(token)]);
    if (!orderResult.ok) {
      setError("Adisyon bulunamadı.");
      return;
    }
    setOrder(orderResult.data);
    if (menuResult.ok) {
      setCategories(menuResult.data.categories);
      setActiveCategory((current) => current ?? menuResult.data.categories[0]?.id ?? null);
    }
  }, [token, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const push = async (product: WaiterProduct, modifierIds: string[]) => {
    if (!token || !id) return;
    setBusy(true);
    const result = await addLines(token, id, [
      { productId: product.id, clientLineId: clientId("line"), quantity: 1, modifierIds },
    ]);
    setBusy(false);
    if (!result.ok) {
      setError(result.error === "ORDER_CLOSED" ? "Adisyon kapanmış." : "Ürün eklenemedi.");
      return;
    }
    setError(null);
    setOrder(result.data);
  };

  const tap = (product: WaiterProduct) => {
    if (product.modifierGroups.length > 0) {
      setChosen([]);
      setSheet(product);
      return;
    }
    void push(product, []);
  };

  const fire = async () => {
    if (!token || !id) return;
    setBusy(true);
    const result = await sendToKitchen(token, id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error === "NOTHING_TO_SEND" ? "Gönderilecek yeni ürün yok." : "Gönderilemedi.");
      return;
    }
    setError(null);
    setOrder(result.data);
  };

  if (waiter.status !== "ready") return null;
  if (!order) {
    return (
      <SafeAreaView style={s.screen}>
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  const category = categories.find((c) => c.id === activeCategory) ?? categories[0];
  const unsent = order.lines.some((line) => line.status === "NEW");

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => router.replace("/waiter")}>
          <Text style={s.back}>‹ Masalar</Text>
        </TouchableOpacity>
        <Text style={s.title}>
          #{order.code}
          {order.tableName ? ` · ${order.tableName}` : ""}
        </Text>
      </View>

      {error && <Text style={s.error}>{error}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.tab, item.id === category?.id && s.tabOn]}
            onPress={() => setActiveCategory(item.id)}
          >
            <Text style={[s.tabText, item.id === category?.id && s.tabTextOn]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.products}>
        {category?.products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={s.product}
            disabled={busy}
            onPress={() => tap(product)}
          >
            <Text style={s.productName}>{product.name}</Text>
            <Text style={s.productPrice}>{money(product.priceMinor, currency)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.cart}>
        <ScrollView style={s.cartLines}>
          {order.lines.length === 0 && <Text style={s.empty}>Adisyonda ürün yok.</Text>}
          {order.lines.map((line) => (
            <View key={line.id} style={s.line}>
              <Text style={s.lineQty}>{line.quantity}x</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.lineName, line.status !== "NEW" && s.lineSent]}>{line.name}</Text>
                {line.modifiers.length > 0 && (
                  <Text style={s.lineSub}>{line.modifiers.join(", ")}</Text>
                )}
              </View>
              <Text style={s.lineTotal}>{money(line.lineTotalMinor, currency)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Toplam</Text>
          <Text style={s.totalValue}>{money(order.totalMinor, currency)}</Text>
        </View>

        <TouchableOpacity
          style={[s.fire, (!unsent || busy) && s.fireOff]}
          disabled={!unsent || busy}
          onPress={fire}
        >
          <Text style={s.fireText}>Mutfağa gönder</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={sheet !== null} transparent animationType="slide">
        <View style={s.sheetBack}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{sheet?.name}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {sheet?.modifierGroups.map((group) => (
                <View key={group.id} style={{ marginBottom: spacing.lg }}>
                  <Text style={s.groupName}>{group.name}</Text>
                  {group.modifiers.map((modifier) => {
                    const on = chosen.includes(modifier.id);
                    return (
                      <TouchableOpacity
                        key={modifier.id}
                        style={[s.option, on && s.optionOn]}
                        onPress={() =>
                          setChosen((prev) =>
                            on ? prev.filter((x) => x !== modifier.id) : [...prev, modifier.id],
                          )
                        }
                      >
                        <Text style={s.optionText}>{modifier.name}</Text>
                        {modifier.priceMinor > 0 && (
                          <Text style={s.optionPrice}>+{money(modifier.priceMinor, currency)}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <View style={s.sheetFoot}>
              <TouchableOpacity style={s.sheetCancel} onPress={() => setSheet(null)}>
                <Text style={s.sheetCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.sheetAdd}
                onPress={() => {
                  const product = sheet;
                  const modifiers = chosen;
                  setSheet(null);
                  if (product) void push(product, modifiers);
                }}
              >
                <Text style={s.sheetAddText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg },
  back: { color: "#9fb3c8", fontSize: 15 },
  title: { color: colors.white, fontSize: 16, fontWeight: "700" },
  error: { color: "#ffc4be", paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  tabs: { flexGrow: 0, paddingHorizontal: spacing.lg },
  tab: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  tabOn: { backgroundColor: "rgba(200,160,74,.18)", borderColor: colors.gold },
  tabText: { color: "#9fb3c8", fontSize: 14, fontWeight: "600" },
  tabTextOn: { color: colors.gold },
  products: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.lg,
  },
  product: {
    width: "47%",
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    backgroundColor: "#0d2c48",
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  productName: { color: colors.white, fontSize: 15, fontWeight: "600" },
  productPrice: { color: colors.gold, fontSize: 16, fontWeight: "700", marginTop: spacing.sm },
  cart: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,.1)",
    backgroundColor: "rgba(0,0,0,.22)",
    maxHeight: "46%",
  },
  cartLines: { paddingHorizontal: spacing.lg },
  empty: { color: "#9fb3c8", paddingVertical: spacing.lg },
  line: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,.06)",
  },
  lineQty: { color: colors.gold, fontWeight: "700", fontSize: 15 },
  lineName: { color: colors.white, fontSize: 15, fontWeight: "600" },
  lineSent: { color: "#9fb3c8" },
  lineSub: { color: "#9fb3c8", fontSize: 12, marginTop: 2 },
  lineTotal: { color: colors.white, fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  totalLabel: { color: colors.white, fontSize: 18, fontWeight: "700" },
  totalValue: { color: colors.gold, fontSize: 18, fontWeight: "700" },
  fire: {
    margin: spacing.lg,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#1c8a5f",
    alignItems: "center",
    justifyContent: "center",
  },
  fireOff: { opacity: 0.4 },
  fireText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  sheetBack: { flex: 1, backgroundColor: "rgba(3,14,24,.72)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#0d2c48",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
  },
  sheetTitle: { color: colors.white, fontSize: 18, fontWeight: "700", marginBottom: spacing.lg },
  groupName: { color: "#9fb3c8", fontSize: 13, marginBottom: spacing.sm },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    marginBottom: spacing.sm,
  },
  optionOn: { borderColor: colors.gold, backgroundColor: "rgba(200,160,74,.16)" },
  optionText: { color: colors.white, fontSize: 15 },
  optionPrice: { color: colors.gold, fontSize: 13 },
  sheetFoot: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  sheetCancel: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: { color: colors.white, fontSize: 15 },
  sheetAdd: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetAddText: { color: "#241a08", fontSize: 15, fontWeight: "700" },
});

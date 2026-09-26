import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useWaiter } from "../../src/lib/waiter-auth";
import { bootstrap, money, openOrder, type WaiterArea, type WaiterBootstrap } from "../../src/lib/waiter";
import { colors, spacing } from "../../src/lib/theme";

/** The floor, as the waiter walks it: which tables are busy and for how long. */
export default function FloorScreen() {
  const waiter = useWaiter();
  const router = useRouter();
  const token = waiter.status === "ready" ? waiter.token : null;
  const currency = waiter.status === "ready" ? waiter.session.venue.currency : "TRY";

  const [data, setData] = useState<WaiterBootstrap | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const result = await bootstrap(token);
    if (!result.ok) {
      setError("Bağlantı kurulamadı.");
      return;
    }
    setError(null);
    setData(result.data);
    setArea((current) => current ?? result.data.areas[0]?.id ?? null);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const minutesSince = (iso: string) => Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));

  const openTable = async (tableId: string | null, existingOrderId?: string) => {
    if (existingOrderId) {
      router.push(`/waiter/order/${existingOrderId}`);
      return;
    }
    if (!token) return;
    setBusy(true);
    const result = await openOrder(token, tableId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error === "TABLE_BUSY" ? "Masada açık adisyon var." : "Adisyon açılamadı.");
      void load();
      return;
    }
    router.push(`/waiter/order/${result.data.id}`);
  };

  if (waiter.status !== "ready") return null;

  const areas: WaiterArea[] = data?.areas ?? [];
  const active = areas.find((a) => a.id === area) ?? areas[0];

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.top}>
        <View>
          <Text style={s.venue}>{waiter.session.venue.name}</Text>
          <Text style={s.staff}>{waiter.session.staff.name}</Text>
        </View>
        <TouchableOpacity style={s.chip} onPress={() => waiter.signOut()}>
          <Text style={s.chipText}>Kilitle</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={s.error}>{error}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs}>
        {areas.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.tab, item.id === active?.id && s.tabOn]}
            onPress={() => setArea(item.id)}
          >
            <Text style={[s.tabText, item.id === active?.id && s.tabTextOn]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[s.tab, s.tabGold]} disabled={busy} onPress={() => openTable(null)}>
          <Text style={[s.tabText, s.tabGoldText]}>+ Paket</Text>
        </TouchableOpacity>
      </ScrollView>

      {!data ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView
          contentContainerStyle={s.grid}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.gold} />}
        >
          {active?.tables.map((table) => (
            <TouchableOpacity
              key={table.id}
              style={[s.table, table.order && s.tableBusy]}
              disabled={busy}
              accessibilityLabel={
                table.order ? `${table.name} - açık adisyon` : `${table.name} - boş, adisyon aç`
              }
              onPress={() => openTable(table.id, table.order?.id)}
            >
              <Text style={s.tableName}>{table.name}</Text>
              <Text style={s.tableSeats}>{table.seats} kişilik</Text>
              {table.order ? (
                <>
                  <Text style={s.tableTotal}>{money(table.order.totalMinor, currency)}</Text>
                  <Text style={s.tableMeta}>
                    #{table.order.code} · {minutesSince(table.order.openedAt)} dk
                  </Text>
                </>
              ) : (
                <Text style={s.tableFree}>Boş</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  venue: { color: colors.white, fontSize: 16, fontWeight: "700" },
  staff: { color: "#9fb3c8", fontSize: 13, marginTop: 2 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.14)",
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    minHeight: 40,
    justifyContent: "center",
  },
  chipText: { color: colors.white, fontSize: 13 },
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
  tabGold: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { color: "#9fb3c8", fontSize: 14, fontWeight: "600" },
  tabTextOn: { color: colors.gold },
  tabGoldText: { color: "#241a08" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    padding: spacing.lg,
  },
  table: {
    width: "47%",
    minHeight: 116,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
    backgroundColor: "#0d2c48",
    padding: spacing.lg,
  },
  tableBusy: { borderColor: "rgba(200,160,74,.55)", backgroundColor: "#10324f" },
  tableName: { color: colors.white, fontSize: 20, fontWeight: "700" },
  tableSeats: { color: "#9fb3c8", fontSize: 12, marginTop: 2 },
  tableTotal: { color: colors.gold, fontSize: 17, fontWeight: "700", marginTop: "auto" },
  tableFree: { color: "#9fb3c8", fontSize: 14, marginTop: "auto" },
  tableMeta: { color: "#9fb3c8", fontSize: 12, marginTop: 2 },
});

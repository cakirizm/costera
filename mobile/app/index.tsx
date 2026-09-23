import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/lib/auth";
import { getRestaurants, getOverview, type MobileOverview, type MobileRestaurant } from "../src/lib/api";
import { colors, spacing } from "../src/lib/theme";
import { t } from "../src/lib/i18n";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const pct = (n: number) => n.toFixed(1) + "%";

function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" }) {
  const borderColor = tone === "good" ? colors.green : tone === "bad" ? colors.red : tone === "warn" ? colors.amber : colors.border;
  return (
    <View style={[s.kpi, { borderLeftColor: borderColor, borderLeftWidth: tone ? 3 : 1 }]}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
      {sub && <Text style={s.kpiSub}>{sub}</Text>}
    </View>
  );
}

function AlertCard({ alert }: { alert: MobileOverview["alerts"][number] }) {
  const kindMap: Record<string, string> = {
    variance: t("variance"),
    "missing-menu": t("missing-menu"),
    "missing-ingredient": t("missing-ingredient"),
    "above-target": t("above-target"),
  };
  const borderColor = alert.severity === "high" ? colors.red : colors.amber;
  return (
    <View style={[s.alert, { borderLeftColor: borderColor }]}>
      <Text style={s.alertKind}>{kindMap[alert.kind] ?? alert.kind}</Text>
      <View style={s.alertRow}>
        <Text style={s.alertSubject} numberOfLines={1}>
          {alert.subject || t("Food cost above target")}
        </Text>
        {alert.value !== null && (
          <Text style={[s.alertValue, { color: borderColor }]}>
            {alert.kind === "above-target" ? `+${pct(alert.value)}` : money(alert.value)}
          </Text>
        )}
      </View>
    </View>
  );
}

function ChannelBar({ name, sales, maxSales }: { name: string; sales: number; maxSales: number }) {
  const width = Math.max(6, (sales / maxSales) * 100);
  return (
    <View style={s.channel}>
      <View style={s.channelHead}>
        <Text style={s.channelName}>{name}</Text>
        <Text style={s.channelSales}>{money(sales)}</Text>
      </View>
      <View style={s.channelTrack}>
        <View style={[s.channelFill, { width: `${width}%` }]} />
      </View>
    </View>
  );
}

export default function OverviewScreen() {
  const auth = useAuth();
  const [restaurant, setRestaurant] = useState<MobileRestaurant | null>(null);
  const [overview, setOverview] = useState<MobileOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const token = auth.status === "authenticated" ? auth.token : null;

  const loadData = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (!isRefresh) setLoading(true);
    setError("");

    const restResult = await getRestaurants(token);
    if (!restResult.ok) {
      setError(t("Data unavailable"));
      setLoading(false);
      return;
    }
    const first = restResult.data.restaurants[0];
    if (!first) {
      setError(t("No restaurant"));
      setLoading(false);
      return;
    }
    setRestaurant(first);

    const overviewResult = await getOverview(token, first.id);
    if (overviewResult.ok) setOverview(overviewResult.data);
    else setError(t("Overview unavailable"));

    setLoading(false);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);

  if (auth.status !== "authenticated") return null;

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      </SafeAreaView>
    );
  }

  const kpis = overview?.kpis;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.logo}>COSTERA</Text>
          <View style={s.headerRight}>
            <View style={s.badgeSmall}>
              <Text style={s.badgeSmallText}>{t("MONITOR")}</Text>
            </View>
            <TouchableOpacity onPress={auth.signOut} activeOpacity={0.7}>
              <Text style={s.logoutText}>{t("Logout")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {restaurant && <Text style={s.restaurantName}>{restaurant.name}</Text>}
        {overview?.source && (
          <View style={s.sourceRow}>
            <View style={[s.sourceDot, {
              backgroundColor:
                overview.source.state === "recent" ? colors.green
                : overview.source.state === "stale" ? colors.red
                : overview.source.state === "imported" ? colors.green
                : colors.textMuted,
            }]} />
            <Text style={s.sourceText}>{overview.source.provider}</Text>
            {overview.period && (
              <Text style={s.periodText}>{overview.period.from} → {overview.period.to}</Text>
            )}
          </View>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} />}
      >
        {error !== "" && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {kpis ? (
          <>
            <View style={s.kpiGrid}>
              <KpiCard label={t("Net Sales")} value={money(kpis.netSales)} sub={`${kpis.unitsSold.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${t("units")}`} tone="good" />
              <KpiCard label={t("Food Cost")} value={kpis.actualFoodCostPct !== null ? pct(kpis.actualFoodCostPct) : "—"} sub={`${t("target")} ${pct(kpis.targetFoodCostPct)}`} tone={kpis.actualFoodCostPct !== null && kpis.actualFoodCostPct > kpis.targetFoodCostPct ? "bad" : "good"} />
              <KpiCard label={t("Unexplained")} value={kpis.unexplainedCost !== null ? money(kpis.unexplainedCost) : "—"} tone={kpis.unexplainedCost !== null && kpis.unexplainedCost > 0 ? "warn" : "good"} />
              {kpis.operatingExpenses !== null && <KpiCard label={t("Op. Expenses")} value={money(kpis.operatingExpenses)} />}
              {kpis.netProfit !== null && <KpiCard label={t("Net Profit")} value={money(kpis.netProfit)} tone={kpis.netProfit >= 0 ? "good" : "bad"} />}
            </View>

            {overview!.channels.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{t("CHANNELS")}</Text>
                {overview!.channels.map((ch) => (
                  <ChannelBar key={ch.name} name={ch.name} sales={ch.sales} maxSales={overview!.channels[0]?.sales || 1} />
                ))}
              </View>
            )}

            {overview!.alerts.length > 0 && (
              <View style={s.section}>
                <View style={s.alertHeader}>
                  <Text style={s.sectionTitle}>{t("ALERTS")}</Text>
                  <View style={s.alertBadge}>
                    <Text style={s.alertBadgeText}>{overview!.alerts.length}</Text>
                  </View>
                </View>
                {overview!.alerts.map((a) => <AlertCard key={a.id} alert={a} />)}
              </View>
            )}
          </>
        ) : (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>{t("No data yet")}</Text>
            <Text style={s.emptyText}>{t("Upload data or connect a source")}</Text>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>{t("Read-only short")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: colors.navy, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  logo: { fontSize: 14, fontWeight: "800", letterSpacing: 3, color: colors.white },
  badgeSmall: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeSmallText: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5, color: colors.gold },
  logoutText: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  restaurantName: { fontSize: 20, fontWeight: "700", color: colors.white, marginTop: spacing.sm },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  sourceDot: { width: 7, height: 7, borderRadius: 4 },
  sourceText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  periodText: { fontSize: 12, color: "rgba(255,255,255,0.45)" },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 40 },

  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpi: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
    flexGrow: 1,
  },
  kpiLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, color: colors.textSecondary, textTransform: "uppercase" },
  kpiValue: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 2 },
  kpiSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1, color: colors.textSecondary, marginBottom: spacing.md },

  channel: { backgroundColor: colors.card, borderRadius: 8, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  channelHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  channelName: { fontSize: 13, fontWeight: "600", color: colors.text },
  channelSales: { fontSize: 13, fontWeight: "700", color: colors.navy },
  channelTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" },
  channelFill: { height: 4, backgroundColor: colors.navy, borderRadius: 2 },

  alertHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.md },
  alertBadge: { backgroundColor: colors.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  alertBadgeText: { fontSize: 11, fontWeight: "700", color: colors.white },
  alert: { backgroundColor: colors.card, borderRadius: 8, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, marginBottom: 6 },
  alertKind: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, color: colors.textMuted, textTransform: "uppercase" },
  alertRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  alertSubject: { fontSize: 13, fontWeight: "600", color: colors.text, flex: 1 },
  alertValue: { fontSize: 12, fontWeight: "700", marginLeft: spacing.sm },

  emptyBox: { backgroundColor: colors.card, borderRadius: 12, padding: spacing.xxl, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm },

  errorBox: { backgroundColor: "#fef2f2", borderLeftWidth: 3, borderLeftColor: colors.red, borderRadius: 6, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { fontSize: 13, color: colors.red },

  footer: { marginTop: spacing.xxl, alignItems: "center" },
  footerText: { fontSize: 11, color: colors.textMuted },
});

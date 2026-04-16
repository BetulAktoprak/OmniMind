import { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { listJournals } from "../../src/api/journal.api";
import { ApiError } from "../../src/api/apiError";
import { getToken, logout } from "../../src/auth/auth.store";
import { BackgroundMesh } from "../../components/BackgroundMesh";
import { CornerFloat3D } from "../../components/CornerFloat3D";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../../src/theme/colors";
import { MOOD_OPTIONS } from "../../src/journal/moodOptions";
import type { JournalListItem } from "../../src/types/journal";

const PAGE_SIZE = 50;

function formatTrDateTimeLines(iso: string): { dateLine: string; timeLine: string } {
  try {
    const d = new Date(iso);
    return {
      dateLine: d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      timeLine: d.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { dateLine: iso, timeLine: "" };
  }
}

function moodEmoji(mood: string | null | undefined): string | null {
  if (!mood?.trim()) return null;
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return found?.emoji ?? "✨";
}

export default function JournalListScreen() {
  const router = useRouter();
  const { colors, isDark, toggleMode } = useOmniTheme();
  const styles = useMemo(() => createJournalListStyles(colors), [colors]);
  const [items, setItems] = useState<JournalListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedOnce = useRef(false);

  const fetchList = useCallback(
    async (mode: "initial" | "silent") => {
      const silent = mode === "silent";
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await listJournals(1, PAGE_SIZE);
        setItems(res.items);
        setTotal(res.totalCount);
        hasFetchedOnce.current = true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          await logout();
          router.replace("/login");
          return;
        }
        setError(e instanceof Error ? e.message : "Liste yüklenemedi.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      void fetchList(hasFetchedOnce.current ? "silent" : "initial");
    }, [fetchList])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BackgroundMesh accent={colors.primary} accent2={colors.accentDot} />

      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.brand}>Günlükler</Text>
          <Text style={styles.headerSub}>Düşüncelerini kaydet, sonra oku</Text>
        </View>
        <Pressable
          onPress={toggleMode}
          accessibilityRole="button"
          accessibilityLabel={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
          style={styles.themeBtn}
        >
          <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
        onPress={() => router.push("/journal/new")}
      >
        <View style={styles.newBtnIconWrap}>
          <Text style={styles.newBtnIcon}>+</Text>
        </View>
        <View style={styles.newBtnTextCol}>
          <Text style={styles.newBtnTitle}>Yeni günlük</Text>
          <Text style={styles.newBtnHint}>Bugün neler yaşadın?</Text>
        </View>
      </Pressable>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.spark} />
          <Text style={styles.loadingHint}>Günlükler yükleniyor…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => fetchList("initial")}>
            <Text style={styles.retryText}>Yeniden dene</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchList("silent")}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📔</Text>
              <Text style={styles.emptyTitle}>Henüz günlük yok</Text>
              <Text style={styles.empty}>
                İlk satırını yazmak için yukarıdaki &quot;Yeni günlük&quot; ile başla.
              </Text>
            </View>
          }
          ListHeaderComponent={
            total > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countDot}>●</Text>
                <Text style={styles.count}>
                  {total} kayıt
                  {total > PAGE_SIZE ? ` · ilk ${PAGE_SIZE} gösteriliyor` : ""}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const { dateLine, timeLine } = formatTrDateTimeLines(item.createdAt);
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.rowPress,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => router.push(`/journal/${item.id}`)}
              >
                <View style={styles.rowShadow}>
                  <View style={styles.rowInnerClip}>
                    <View style={styles.rowAccent} />
                    <View style={styles.rowMain}>
                      <View style={styles.rowTop}>
                        <Text style={styles.rowTitle} numberOfLines={2}>
                          {item.title?.trim() || "Başlıksız"}
                        </Text>
                        <View style={styles.rowDateCol}>
                          <Text style={styles.rowDateLine}>{dateLine}</Text>
                          {timeLine ? (
                            <Text style={styles.rowTimeLine}>{timeLine}</Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.rowFooter}>
                        {item.mood ? (
                          <View style={styles.moodChip}>
                            <Text style={styles.moodEmojiText}>
                              {moodEmoji(item.mood)}
                            </Text>
                            <Text style={styles.rowMood}>{item.mood}</Text>
                          </View>
                        ) : (
                          <View style={styles.moodPlaceholder} />
                        )}
                        <Text style={styles.chevron}>›</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <CornerFloat3D accent={colors.primary} accent2={colors.accentDot} position="bottom-right" />
    </SafeAreaView>
  );
}

function createJournalListStyles(colors: ThemePalette) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white12,
    marginTop: 2,
  },
  backText: {
    color: colors.textOnDark,
    fontSize: 18,
    fontFamily: FONT.semi,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white12,
    marginTop: 2,
  },
  themeBtnText: { fontSize: 15 },
  brand: {
    color: colors.textOnDark,
    fontSize: 18,
    fontFamily: FONT.title,
    letterSpacing: -0.4,
  },
  headerSub: {
    marginTop: 4,
    color: colors.mutedOnDark,
    fontSize: 12,
    fontFamily: FONT.reg,
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.95,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 22,
    marginTop: 18,
    marginBottom: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "rgba(45, 52, 42, 0.12)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 3,
  },
  newBtnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  newBtnIcon: {
    color: colors.textOnPrimary,
    fontSize: 26,
    fontFamily: FONT.title,
    marginTop: -2,
  },
  newBtnTextCol: { flex: 1 },
  newBtnTitle: {
    color: colors.textOnLight,
    fontSize: 16,
    fontFamily: FONT.semi,
    letterSpacing: -0.2,
  },
  newBtnHint: {
    marginTop: 3,
    color: colors.mutedOnLight,
    fontSize: 12.5,
    fontFamily: FONT.reg,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingHint: {
    marginTop: 14,
    color: colors.mutedOnDark,
    fontSize: 13,
    fontFamily: FONT.reg,
  },
  list: { flex: 1 },
  errorText: {
    color: colors.error,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
  retry: { marginTop: 12, padding: 12 },
  retryText: { color: colors.primary, fontFamily: FONT.semi },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 12,
    flexGrow: 1,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.softSlate2,
    borderWidth: 1,
    borderColor: "rgba(109, 128, 104, 0.18)",
    marginBottom: 14,
  },
  countDot: {
    fontSize: 8,
    color: colors.primary,
    marginTop: 1,
  },
  count: {
    color: colors.subtleOnDark,
    fontSize: 12,
    fontFamily: FONT.semi,
    letterSpacing: 0.2,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.textOnDark,
    fontSize: 17,
    fontFamily: FONT.title,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  empty: {
    color: colors.mutedOnDark,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FONT.reg,
    textAlign: "center",
    maxWidth: 280,
  },
  rowPress: { marginBottom: 12 },
  rowShadow: {
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "rgba(45, 52, 42, 0.1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  rowInnerClip: {
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
  },
  rowAccent: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  rowMain: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingRight: 10,
    minWidth: 0,
  },
  rowPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    color: colors.textOnLight,
    fontSize: 16,
    fontFamily: FONT.semi,
    lineHeight: 22,
    paddingRight: 4,
    letterSpacing: -0.2,
  },
  rowDateCol: {
    alignItems: "flex-end",
    maxWidth: "40%",
    flexShrink: 0,
    paddingTop: 1,
  },
  rowDateLine: {
    color: colors.mutedOnLight,
    fontSize: 11,
    fontFamily: FONT.reg,
    textAlign: "right",
    lineHeight: 15,
  },
  rowTimeLine: {
    marginTop: 2,
    color: colors.labelOnLight,
    fontSize: 12,
    fontFamily: FONT.semi,
    textAlign: "right",
    opacity: 0.9,
  },
  rowFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.softSlate2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  moodEmojiText: { fontSize: 13 },
  rowMood: {
    color: colors.primaryPressed,
    fontSize: 12,
    fontFamily: FONT.semi,
  },
  moodPlaceholder: { flex: 1 },
  chevron: {
    fontSize: 22,
    color: colors.mutedOnLight,
    fontFamily: FONT.reg,
    marginLeft: 8,
    marginRight: 2,
  },
});
}

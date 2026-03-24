import { useCallback, useRef, useState } from "react";
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
import { colors, fonts as FONT } from "../../src/theme/colors";
import type { JournalListItem } from "../../src/types/journal";

const PAGE_SIZE = 50;

function formatTr(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function JournalListScreen() {
  const router = useRouter();
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
      <StatusBar barStyle="dark-content" />
      <View style={styles.blob} />
      <View style={[styles.blob, styles.blob2]} />

      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.brand}>Günlükler</Text>
        <View style={{ width: 32 }} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
        onPress={() => router.push("/journal/new")}
      >
        <Text style={styles.newBtnText}>+ Yeni günlük</Text>
      </Pressable>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Henüz günlük yok. İlk kaydını oluşturmak için yukarıdaki butonu kullan.
            </Text>
          }
          ListHeaderComponent={
            total > 0 ? (
              <Text style={styles.count}>
                {total} kayıt
                {total > PAGE_SIZE ? ` (ilk ${PAGE_SIZE} gösteriliyor)` : ""}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.push(`/journal/${item.id}`)}
            >
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title?.trim() || "Başlıksız"}
              </Text>
              <View style={styles.rowMeta}>
                {item.mood ? (
                  <Text style={styles.rowMood}>{item.mood}</Text>
                ) : null}
                <Text style={styles.rowDate}>{formatTr(item.createdAt)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: colors.blobTint,
    top: -140,
    right: -120,
  },
  blob2: {
    top: undefined,
    right: undefined,
    bottom: -180,
    left: -140,
    backgroundColor: colors.blobTint2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white12,
  },
  backText: {
    color: colors.textOnDark,
    fontSize: 18,
    fontFamily: FONT.semi,
  },
  brand: {
    color: colors.textOnDark,
    fontSize: 17,
    fontFamily: FONT.title,
    letterSpacing: -0.3,
  },
  newBtn: {
    marginHorizontal: 22,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  newBtnText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontFamily: FONT.semi,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    paddingBottom: 24,
    paddingTop: 8,
    flexGrow: 1,
  },
  count: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontFamily: FONT.semi,
    marginBottom: 10,
  },
  empty: {
    color: colors.mutedOnDark,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FONT.reg,
    textAlign: "center",
    marginTop: 32,
    paddingHorizontal: 12,
  },
  row: {
    backgroundColor: colors.white06,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.white10,
    padding: 14,
    marginBottom: 10,
  },
  rowPressed: { opacity: 0.9 },
  rowTitle: {
    color: colors.textOnDark,
    fontSize: 16,
    fontFamily: FONT.semi,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap",
  },
  rowMood: {
    color: colors.primaryPressed,
    fontSize: 12.5,
    fontFamily: FONT.semi,
  },
  rowDate: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontFamily: FONT.reg,
  },
});

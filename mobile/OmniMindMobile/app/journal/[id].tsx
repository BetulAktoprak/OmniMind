import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { deleteJournal, getJournal } from "../../src/api/journal.api";
import { ApiError } from "../../src/api/apiError";
import { getToken, logout } from "../../src/auth/auth.store";
import { colors, fonts as FONT } from "../../src/theme/colors";
import type { JournalDetail } from "../../src/types/journal";
import { useRouteId } from "../../src/router/useRouteId";

function formatTr(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function JournalDetailScreen() {
  const id = useRouteId("id");
  const router = useRouter();
  const [entry, setEntry] = useState<JournalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setError("Geçersiz kayıt.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const data = await getJournal(id);
      setEntry(data);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  function confirmDelete() {
    if (!id || deleting) return;
    Alert.alert(
      "Günlüğü sil",
      "Bu kayıt kalıcı olarak silinmez; listeden kaldırılır. Emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteJournal(id);
              router.replace("/journal");
            } catch (e) {
              if (e instanceof ApiError && e.status === 401) {
                await logout();
                router.replace("/login");
                return;
              }
              Alert.alert(
                "Hata",
                e instanceof Error ? e.message : "Silinemedi."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Günlük
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Yeniden dene</Text>
          </Pressable>
        </View>
      ) : entry ? (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {entry.title?.trim() || "Başlıksız"}
              </Text>
              <View style={styles.meta}>
                {entry.mood ? (
                  <Text style={styles.mood}>{entry.mood}</Text>
                ) : null}
                <Text style={styles.date}>{formatTr(entry.createdAt)}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.body}>{entry.body}</Text>
              {entry.aiComment ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.insightSectionLabel}>Yorum</Text>
                  <Text style={styles.insightBody}>{entry.aiComment}</Text>
                </>
              ) : null}
              {entry.aiMusicSuggestion ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.insightSectionLabel}>Müzik önerisi</Text>
                  <Text style={styles.insightBody}>{entry.aiMusicSuggestion}</Text>
                </>
              ) : null}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.dangerBtn,
                deleting && styles.saveDisabled,
                pressed && styles.pressed,
              ]}
              onPress={confirmDelete}
              disabled={deleting}
            >
              <Text style={styles.dangerText}>
                {deleting ? "Siliniyor…" : "Sil"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: colors.textOnDark,
    fontSize: 17,
    fontFamily: FONT.title,
    marginHorizontal: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: colors.error, fontFamily: FONT.reg, textAlign: "center" },
  retry: { marginTop: 12 },
  retryText: { color: colors.primary, fontFamily: FONT.semi },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 22, paddingBottom: 16 },
  card: {
    marginTop: 8,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTitle: {
    color: colors.textOnLight,
    fontSize: 20,
    fontFamily: FONT.title,
    letterSpacing: -0.4,
  },
  meta: { marginTop: 8, gap: 4 },
  mood: {
    color: colors.primaryPressed,
    fontSize: 13,
    fontFamily: FONT.semi,
  },
  date: {
    color: colors.mutedOnLight,
    fontSize: 12.5,
    fontFamily: FONT.reg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginVertical: 16,
  },
  body: {
    color: colors.textOnLight,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FONT.reg,
  },
  insightSectionLabel: {
    fontSize: 11,
    fontFamily: FONT.semi,
    color: colors.labelOnLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: FONT.reg,
    color: colors.textOnLight,
  },
  actions: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 8,
  },
  dangerBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "rgba(155, 74, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(155, 74, 68, 0.35)",
  },
  dangerText: {
    color: colors.error,
    fontSize: 15,
    fontFamily: FONT.semi,
  },
  saveDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.9 },
});

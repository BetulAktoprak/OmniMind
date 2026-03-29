import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MOOD_OPTIONS } from "../../src/journal/moodOptions";
import type { JournalDetail } from "../../src/types/journal";
import { useRouteId } from "../../src/router/useRouteId";

function formatTrDateTimeLines(iso: string): { dateLine: string; timeLine: string } {
  try {
    const d = new Date(iso);
    return {
      dateLine: d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
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

  const hasAi = useMemo(
    () =>
      Boolean(
        entry?.aiComment?.trim() || entry?.aiMusicSuggestion?.trim()
      ),
    [entry?.aiComment, entry?.aiMusicSuggestion]
  );

  const dateHead = useMemo(
    () => (entry ? formatTrDateTimeLines(entry.createdAt) : null),
    [entry]
  );

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
              <View style={styles.cardAccent} />
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle} numberOfLines={3}>
                  {entry.title?.trim() || "Başlıksız"}
                </Text>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateRightDate}>{dateHead?.dateLine}</Text>
                  {dateHead?.timeLine ? (
                    <Text style={styles.dateRightTime}>{dateHead.timeLine}</Text>
                  ) : null}
                </View>
              </View>
              {entry.mood ? (
                <View style={styles.chipRow}>
                  <View style={styles.moodChip}>
                    <Text style={styles.moodEmoji}>{moodEmoji(entry.mood)}</Text>
                    <Text style={styles.moodChipText}>{entry.mood}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Günlük</Text>
                <View style={styles.bodyWrap}>
                  <Text style={styles.body}>{entry.body}</Text>
                </View>
              </View>

              {hasAi ? (
                <View style={styles.aiBlock}>
                  <Text style={styles.aiBlockTitle}>OmniMind yorumu</Text>
                  {entry.aiComment ? (
                    <View style={styles.insightCard}>
                      <View style={styles.insightCardTop}>
                        <Text style={styles.insightEmoji}>💬</Text>
                        <Text style={styles.insightCardLabel}>Yorum</Text>
                      </View>
                      <Text style={styles.insightBody}>{entry.aiComment}</Text>
                    </View>
                  ) : null}
                  {entry.aiMusicSuggestion ? (
                    <View style={[styles.insightCard, styles.insightCardMusic]}>
                      <View style={styles.insightCardTop}>
                        <Text style={styles.insightEmoji}>🎵</Text>
                        <Text style={styles.insightCardLabel}>Müzik önerisi</Text>
                      </View>
                      <Text style={styles.insightBody}>
                        {entry.aiMusicSuggestion}
                      </Text>
                    </View>
                  ) : null}
                </View>
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
              <Text style={styles.dangerBtnIcon}>🗑</Text>
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
    letterSpacing: -0.3,
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
  scrollContent: { paddingHorizontal: 22, paddingBottom: 28 },
  card: {
    marginTop: 10,
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 22,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "rgba(45, 52, 42, 0.18)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
    opacity: 0.55,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 4,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: colors.textOnLight,
    fontSize: 22,
    fontFamily: FONT.title,
    letterSpacing: -0.5,
    lineHeight: 28,
    paddingRight: 4,
  },
  dateColumn: {
    alignItems: "flex-end",
    maxWidth: "44%",
    flexShrink: 0,
    paddingTop: 3,
  },
  dateRightDate: {
    fontSize: 12,
    fontFamily: FONT.reg,
    color: colors.mutedOnLight,
    textAlign: "right",
    lineHeight: 17,
  },
  dateRightTime: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: FONT.semi,
    color: colors.labelOnLight,
    textAlign: "right",
    opacity: 0.92,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.softSlate2,
    borderWidth: 1,
    borderColor: "rgba(109, 128, 104, 0.2)",
  },
  moodEmoji: { fontSize: 15 },
  moodChipText: {
    color: colors.primaryPressed,
    fontSize: 13,
    fontFamily: FONT.semi,
  },
  section: { marginTop: 22 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONT.semi,
    color: colors.labelOnLight,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 10,
    opacity: 0.85,
  },
  bodyWrap: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  body: {
    color: colors.textOnLight,
    fontSize: 15.5,
    lineHeight: 25,
    fontFamily: FONT.reg,
  },
  aiBlock: { marginTop: 22, gap: 12 },
  aiBlockTitle: {
    fontSize: 11,
    fontFamily: FONT.semi,
    color: colors.primaryPressed,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  insightCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(109, 128, 104, 0.09)",
    borderWidth: 1,
    borderColor: "rgba(109, 128, 104, 0.22)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightCardMusic: {
    backgroundColor: "rgba(130, 152, 118, 0.12)",
    borderLeftColor: colors.accentDot,
  },
  insightCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  insightEmoji: { fontSize: 16 },
  insightCardLabel: {
    fontSize: 14,
    fontFamily: FONT.semi,
    color: colors.textOnLight,
    letterSpacing: -0.2,
  },
  insightBody: {
    fontSize: 14.5,
    lineHeight: 23,
    fontFamily: FONT.reg,
    color: colors.textOnLight,
  },
  actions: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.white10,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: "rgba(155, 74, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(155, 74, 68, 0.28)",
  },
  dangerBtnIcon: { fontSize: 15 },
  dangerText: {
    color: colors.error,
    fontSize: 15,
    fontFamily: FONT.semi,
  },
  saveDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.88 },
});

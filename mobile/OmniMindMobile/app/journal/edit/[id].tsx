import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { analyzeJournalDraft } from "../../../src/api/journalInsights.api";
import { getJournal, updateJournal } from "../../../src/api/journal.api";
import { ApiError } from "../../../src/api/apiError";
import { getToken, logout } from "../../../src/auth/auth.store";
import { JournalFormFields } from "../../../src/journal/JournalFormFields";
import { CornerFloat3D } from "../../../components/CornerFloat3D";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../../../src/theme/colors";
import { useRouteId } from "../../../src/router/useRouteId";

function createEditJournalStyles(colors: ThemePalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
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
    title: {
      color: colors.textOnDark,
      fontSize: 17,
      fontFamily: FONT.title,
      letterSpacing: -0.3,
    },
    formWrap: { flex: 1, paddingHorizontal: 22, marginTop: 8 },
    footer: {
      paddingHorizontal: 22,
      paddingBottom: 16,
      paddingTop: 8,
    },
    saveBtn: {
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    saveDisabled: { opacity: 0.55 },
    saveText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontFamily: FONT.title,
    },
    pressed: { opacity: 0.92 },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    errorText: { color: colors.error, fontFamily: FONT.reg, textAlign: "center" },
    retry: { marginTop: 12 },
    retryText: { color: colors.primary, fontFamily: FONT.semi },
  });
}

export default function EditJournalScreen() {
  const id = useRouteId("id");
  const router = useRouter();
  const { colors, isDark } = useOmniTheme();
  const styles = useMemo(() => createEditJournalStyles(colors), [colors]);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightComment, setInsightComment] = useState<string | null>(null);
  const [insightMusic, setInsightMusic] = useState<string | null>(null);
  /** Sunucuda zaten yorum varsa tekrar "Yorum yap" gösterme. */
  const [hasSavedInsight, setHasSavedInsight] = useState(false);

  async function onInsight() {
    const t = body.trim();
    if (t.length < 10 || insightLoading) return;
    setInsightError(null);
    setInsightLoading(true);
    try {
      const r = await analyzeJournalDraft(t, mood);
      setInsightComment(r.comment);
      setInsightMusic(r.musicSuggestion);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setInsightError(e instanceof Error ? e.message : "Yorum alınamadı.");
    } finally {
      setInsightLoading(false);
    }
  }

  const load = useCallback(async () => {
    if (!id) {
      setLoadError("Geçersiz kayıt.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const data = await getJournal(id);
      setTitle(data.title ?? "");
      setMood(data.mood);
      setBody(data.body);
      setInsightComment(data.aiComment?.trim() ? data.aiComment : null);
      setInsightMusic(
        data.aiMusicSuggestion?.trim() ? data.aiMusicSuggestion : null
      );
      setHasSavedInsight(
        Boolean(
          (data.aiComment && data.aiComment.trim()) ||
            (data.aiMusicSuggestion && data.aiMusicSuggestion.trim())
        )
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setLoadError(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!id || !body.trim() || saving) return;
    setFormError(null);
    setSaving(true);
    try {
      await updateJournal(id, {
        title: title.trim() || null,
        mood,
        body: body.trim(),
        insight:
          !hasSavedInsight && insightComment && insightMusic
            ? { comment: insightComment, musicSuggestion: insightMusic }
            : undefined,
      });
      router.replace(`/journal/${id}` as Href);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setFormError(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Düzenle</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.spark} />
          </View>
        ) : loadError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable style={styles.retry} onPress={load}>
              <Text style={styles.retryText}>Yeniden dene</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.formWrap}>
              <JournalFormFields
                title={title}
                onTitleChange={setTitle}
                mood={mood}
                onMoodChange={setMood}
                body={body}
                onBodyChange={setBody}
                error={formError}
                onRequestInsight={hasSavedInsight ? undefined : onInsight}
                insightLoading={insightLoading}
                insightError={insightError}
                insightComment={insightComment}
                insightMusic={insightMusic}
              />
            </View>
            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  (!body.trim() || saving) && styles.saveDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={onSave}
                disabled={!body.trim() || saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <Text style={styles.saveText}>Güncelle</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      <CornerFloat3D accent={colors.primary} accent2={colors.accentDot} position="bottom-right" />
    </SafeAreaView>
  );
}

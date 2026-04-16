import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { analyzeJournalDraft } from "../../src/api/journalInsights.api";
import { createJournal } from "../../src/api/journal.api";
import { ApiError } from "../../src/api/apiError";
import { logout } from "../../src/auth/auth.store";
import { JournalFormFields } from "../../src/journal/JournalFormFields";
import { CornerFloat3D } from "../../components/CornerFloat3D";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../../src/theme/colors";

function createNewJournalStyles(colors: ThemePalette) {
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
  });
}

export default function NewJournalScreen() {
  const router = useRouter();
  const { colors, isDark } = useOmniTheme();
  const styles = useMemo(() => createNewJournalStyles(colors), [colors]);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightComment, setInsightComment] = useState<string | null>(null);
  const [insightMusic, setInsightMusic] = useState<string | null>(null);

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

  async function onSave() {
    if (!body.trim() || saving) return;
    setError(null);
    setSaving(true);
    try {
      const id = await createJournal({
        title: title.trim() || null,
        mood,
        body: body.trim(),
        insight:
          insightComment && insightMusic
            ? { comment: insightComment, musicSuggestion: insightMusic }
            : undefined,
      });
      router.replace(`/journal/${id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Yeni günlük</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.formWrap}>
          <JournalFormFields
            title={title}
            onTitleChange={setTitle}
            mood={mood}
            onMoodChange={setMood}
            body={body}
            onBodyChange={setBody}
            error={error}
            onRequestInsight={onInsight}
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
              <Text style={styles.saveText}>Kaydet</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CornerFloat3D accent={colors.primary} accent2={colors.accentDot} position="bottom-right" />
    </SafeAreaView>
  );
}

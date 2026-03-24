import { useState } from "react";
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
import { useRouter } from "expo-router";
import { createJournal } from "../../src/api/journal.api";
import { ApiError } from "../../src/api/apiError";
import { logout } from "../../src/auth/auth.store";
import { JournalFormFields } from "../../src/journal/JournalFormFields";
import { colors, fonts as FONT } from "../../src/theme/colors";

export default function NewJournalScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!body.trim() || saving) return;
    setError(null);
    setSaving(true);
    try {
      const id = await createJournal({
        title: title.trim() || null,
        mood,
        body: body.trim(),
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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

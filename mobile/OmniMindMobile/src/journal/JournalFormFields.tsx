import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colors, fonts as FONT } from "../theme/colors";
import { MOOD_OPTIONS } from "./moodOptions";

const MIN_CHARS_FOR_INSIGHT = 10;

type Props = {
  title: string;
  onTitleChange: (t: string) => void;
  mood: string | null;
  onMoodChange: (m: string | null) => void;
  body: string;
  onBodyChange: (b: string) => void;
  error: string | null;
  onRequestInsight?: () => void;
  insightLoading?: boolean;
  insightError?: string | null;
  insightComment?: string | null;
  insightMusic?: string | null;
};

export function JournalFormFields({
  title,
  onTitleChange,
  mood,
  onMoodChange,
  body,
  onBodyChange,
  error,
  onRequestInsight,
  insightLoading = false,
  insightError = null,
  insightComment = null,
  insightMusic = null,
}: Props) {
  const bodyTrim = body.trim();
  const canInsight = bodyTrim.length >= MIN_CHARS_FOR_INSIGHT;
  const showInsightArea =
    onRequestInsight != null ||
    Boolean(insightComment) ||
    Boolean(insightMusic) ||
    Boolean(insightError);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.label}>Başlık (isteğe bağlı)</Text>
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          placeholder="Kısa bir başlık"
          placeholderTextColor={colors.placeholderOnLight}
          style={styles.input}
          maxLength={200}
        />

        <Text style={[styles.label, styles.labelSpaced]}>Ruh hali</Text>
        <View style={styles.moodRow}>
          {MOOD_OPTIONS.map((m) => {
            const active = mood === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => onMoodChange(active ? null : m.value)}
                style={[
                  styles.moodChip,
                  active && styles.moodChipActive,
                ]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>
                  {m.value}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.labelSpaced]}>Günlük</Text>
        <TextInput
          value={body}
          onChangeText={onBodyChange}
          placeholder="Bugün neler yaşadın?"
          placeholderTextColor={colors.placeholderOnLight}
          style={[styles.input, styles.bodyInput]}
          multiline
          textAlignVertical="top"
        />

        {showInsightArea ? (
          <View style={styles.insightBlock}>
            {onRequestInsight ? (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.insightBtn,
                    (!canInsight || insightLoading) && styles.insightBtnDisabled,
                    pressed && canInsight && !insightLoading && styles.pressedInsight,
                  ]}
                  onPress={onRequestInsight}
                  disabled={!canInsight || insightLoading}
                >
                  {insightLoading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Text style={styles.insightBtnText}>Yorum yap</Text>
                  )}
                </Pressable>
                {!canInsight ? (
                  <Text style={styles.insightHint}>
                    Yorum için en az {MIN_CHARS_FOR_INSIGHT} karakter yazın.
                  </Text>
                ) : null}
              </>
            ) : insightComment || insightMusic ? (
              <Text style={styles.insightSavedHint}>Kayıtlı yorum</Text>
            ) : null}
            {insightError ? (
              <Text style={styles.insightErr}>{insightError}</Text>
            ) : null}
            {insightComment ? (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Yorum</Text>
                <Text style={styles.insightBody}>{insightComment}</Text>
              </View>
            ) : null}
            {insightMusic ? (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Müzik önerisi</Text>
                <Text style={styles.insightBody}>{insightMusic}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    color: colors.labelOnLight,
    fontSize: 12.5,
    fontFamily: FONT.semi,
  },
  labelSpaced: { marginTop: 14 },
  input: {
    marginTop: 6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    color: colors.textOnLight,
    fontFamily: FONT.reg,
    fontSize: 14,
  },
  bodyInput: {
    minHeight: 200,
    paddingTop: 12,
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  moodChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(109, 128, 104, 0.12)",
  },
  moodEmoji: { fontSize: 13 },
  moodLabel: {
    fontSize: 12.5,
    fontFamily: FONT.semi,
    color: colors.textOnLight,
  },
  moodLabelActive: { color: colors.primaryPressed },
  error: {
    marginTop: 12,
    color: colors.error,
    fontSize: 13,
    fontFamily: FONT.semi,
  },
  insightBlock: { marginTop: 16, gap: 10 },
  insightSavedHint: {
    fontSize: 12,
    fontFamily: FONT.semi,
    color: colors.mutedOnLight,
  },
  insightBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.white06,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBtnDisabled: { opacity: 0.45, borderColor: colors.inputBorder },
  pressedInsight: { opacity: 0.88 },
  insightBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: FONT.semi,
  },
  insightHint: {
    fontSize: 12,
    fontFamily: FONT.reg,
    color: colors.mutedOnLight,
  },
  insightErr: {
    fontSize: 13,
    fontFamily: FONT.semi,
    color: colors.error,
  },
  insightCard: {
    marginTop: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(109, 128, 104, 0.08)",
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  insightLabel: {
    fontSize: 11,
    fontFamily: FONT.semi,
    color: colors.labelOnLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  insightBody: {
    fontSize: 14,
    fontFamily: FONT.reg,
    color: colors.textOnLight,
    lineHeight: 21,
  },
});

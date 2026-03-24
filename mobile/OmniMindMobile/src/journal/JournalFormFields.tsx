import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { colors, fonts as FONT } from "../theme/colors";
import { MOOD_OPTIONS } from "./moodOptions";

type Props = {
  title: string;
  onTitleChange: (t: string) => void;
  mood: string | null;
  onMoodChange: (m: string | null) => void;
  body: string;
  onBodyChange: (b: string) => void;
  error: string | null;
};

export function JournalFormFields({
  title,
  onTitleChange,
  mood,
  onMoodChange,
  body,
  onBodyChange,
  error,
}: Props) {
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
});

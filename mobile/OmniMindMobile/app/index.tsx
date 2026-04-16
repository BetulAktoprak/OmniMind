import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackgroundMesh } from "../components/BackgroundMesh";
import { getToken } from "../src/auth/auth.store";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../src/theme/colors";

type MoodKey = "calm" | "focused" | "happy" | "tired" | "anxious";

function buildMoods(icon: ThemePalette["icon"]) {
  return {
    calm: { label: "Sakin", emoji: "🌿", accent: "#5c7cba", accent2: "#e4eaf7" },
    focused: { label: "Odak", emoji: "🎯", accent: icon.navy, accent2: "#d6e0f4" },
    happy: { label: "İyi", emoji: "☀️", accent: icon.yellowBright, accent2: "#fff9e6" },
    tired: { label: "Yorgun", emoji: "🌙", accent: "#6b7280", accent2: "#e5e7eb" },
    anxious: { label: "Stresli", emoji: "⚡", accent: "#c45c3c", accent2: "#fde8e4" },
  } satisfies Record<
    MoodKey,
    { label: string; emoji: string; accent: string; accent2: string }
  >;
}

export default function Landing() {
  const router = useRouter();
  const { colors, isDark, toggleMode } = useOmniTheme();
  const moods = useMemo(() => buildMoods(colors.icon), [colors]);
  const styles = useMemo(() => createLandingStyles(colors), [colors]);

  const [mood, setMood] = useState<MoodKey>("calm");

  // Soft floating animation for preview card
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) router.replace("/home");
      } catch { }
    })();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();

    return () => {
      floatLoop.stop();
    };
  }, [router, float]);

  const { accent, accent2 } = moods[mood];

  const previewFloatStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }),
        },
      ],
    }),
    [float]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <BackgroundMesh accent={accent} accent2={accent2} />

        {/* Brand row */}
        <View style={styles.topRow}>
          <View style={[styles.logoMark, { borderColor: colors.white10 }]}>
            <View style={[styles.logoDot, { backgroundColor: accent }]} />
          </View>
          <Text style={styles.brand}>OmniMind</Text>

          <View style={{ flex: 1 }} />
          <View style={[styles.moodPill, { borderColor: colors.white10 }]}>
            <Text style={styles.moodPillText}>
              {moods[mood].emoji} {moods[mood].label}
            </Text>
          </View>
          <Pressable
            onPress={toggleMode}
            accessibilityRole="button"
            accessibilityLabel={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
            style={[styles.themeBtn, { borderColor: colors.white10 }]}
          >
            <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>Günlük • Ruh Hali • İçgörü</Text>

          <View style={styles.titleBox}>
            <Text style={[styles.titleGlow, { textShadowColor: accent }]}>Aklımda.</Text>
            <Text style={styles.title}>Aklımda.</Text>
            <View style={[styles.titleUnderline, { backgroundColor: accent }]} />
          </View>

          <Text style={styles.subtitle}>
            Gününü birkaç cümleyle kaydet. Ruh halini işaretle. Zamanla neyin iyi geldiğini gör.
          </Text>

          {/* Mood selector chips */}
          <View style={styles.moodsRow}>
            {(Object.keys(moods) as MoodKey[]).map((k) => {
              const active = k === mood;
              const m = moods[k];
              return (
                <Pressable
                  key={k}
                  onPress={() => setMood(k)}
                  style={[
                    styles.moodChip,
                    active && {
                      borderColor: `${m.accent}99`,
                      backgroundColor: `${m.accent}22`,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodLabel}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.mid}>
          <Animated.View style={[styles.previewCard, previewFloatStyle]}>
            <View style={styles.previewTop}>
              <Text style={styles.previewTitle}>Bugünün Kaydı</Text>
              <View style={[styles.previewTag, { borderColor: `${accent}66`, backgroundColor: `${accent}18` }]}>
                <Text style={[styles.previewTagText, { color: colors.white90 }]}>
                  {moods[mood].emoji} {moods[mood].label}
                </Text>
              </View>
            </View>

            <Text style={styles.previewPrompt}>Bugün aklında en çok ne vardı?</Text>

            <View style={styles.previewNote}>
              <View style={[styles.previewBar, { backgroundColor: accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.previewNoteTitle}>Kısa not</Text>
                <Text style={styles.previewNoteBody}>
                  “Bir şeyi bitirince gerçekten rahatladım. Yürüyüş iyi geldi…”
                </Text>
              </View>
            </View>

          </Animated.View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>Giriş Yap</Text>
            <Text style={styles.primaryHint}>Kaldığın yerden devam et</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/register")}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: colors.white16 },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Kayıt Ol</Text>
            <Text style={styles.secondaryHint}>Yeni bir başlangıç</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Devam ederek kullanım şartlarını ve gizlilik politikasını kabul etmiş olursun.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createLandingStyles(colors: ThemePalette) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    overflow: "hidden",
  },

  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.white06,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoDot: { width: 10, height: 10, borderRadius: 10 },
  brand: {
    color: colors.white86,
    fontSize: 14,
    letterSpacing: 0.4,
    fontFamily: FONT.semi,
  },

  moodPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white06,
    borderWidth: 1,
  },
  moodPillText: { color: colors.white80, fontSize: 12, fontFamily: FONT.semi },

  themeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white06,
    borderWidth: 1,
  },
  themeBtnText: { fontSize: 15 },

  hero: { marginTop: 25 },
  kicker: {
    color: colors.spark,
    fontSize: 12.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT.semi,
  },

  titleBox: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.white08,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.4,
    fontFamily: FONT.title,
  },
  titleGlow: {
    position: "absolute",
    color: colors.textOnDark,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.4,
    fontFamily: FONT.title,
    opacity: 0.12,
    ...Platform.select({
      ios: { textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 22 },
      android: {},
    }),
  },
  titleUnderline: {
    marginTop: 8,
    height: 4,
    width: 56,
    borderRadius: 999,
  },

  subtitle: {
    marginTop: 12,
    color: colors.mutedOnDark,
    fontSize: 14.8,
    lineHeight: 22,
    maxWidth: 420,
    fontFamily: FONT.reg,
  },

  moodsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: { color: colors.white84, fontSize: 12.5, fontFamily: FONT.semi },

  mid: { marginTop: 18, flex: 1, justifyContent: "center" },

  previewCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.white06,
    borderWidth: 1,
    borderColor: colors.white10,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.35)",
        shadowOpacity: 1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
    }),
  },
  previewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  previewTitle: { color: colors.white88, fontSize: 13, fontFamily: FONT.semi },
  previewTag: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  previewTagText: { fontSize: 12, fontFamily: FONT.semi },

  previewPrompt: { color: colors.subtleOnDark, fontSize: 12.5, fontFamily: FONT.reg, marginBottom: 10 },

  previewNote: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 8 },
  previewBar: { width: 4, height: 44, borderRadius: 999, opacity: 0.9 },
  previewNoteTitle: { color: colors.white90, fontSize: 13.5, fontFamily: FONT.semi, letterSpacing: -0.2 },
  previewNoteBody: { marginTop: 4, color: colors.white58, fontSize: 12.5, lineHeight: 18, fontFamily: FONT.reg },

  previewDivider: { marginTop: 10, height: 1, backgroundColor: colors.white08 },

  previewFooter: { marginTop: 12, flexDirection: "row", gap: 10 },
  miniStat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.white10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white05,
  },
  miniStatTop: {
    fontSize: 16,
    fontFamily: FONT.title,
    letterSpacing: -0.4,
    color: colors.textOnDark,
  },
  miniStatTop2: { color: colors.white90, fontSize: 15, fontFamily: FONT.title, letterSpacing: -0.4 },
  miniStatSub: { marginTop: 2, color: colors.white45, fontSize: 11.5, fontFamily: FONT.reg },

  actions: { paddingTop: 10 },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryText: { color: colors.textOnPrimary, fontSize: 16.5, fontFamily: FONT.title, letterSpacing: -0.2 },
  primaryHint: { color: colors.hintOnPrimary, fontSize: 12, marginTop: 4, fontFamily: FONT.reg },

  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: colors.textOnDark, fontSize: 16.5, fontFamily: FONT.title, letterSpacing: -0.2 },
  secondaryHint: { color: colors.mutedOnDark, fontSize: 12, marginTop: 4, fontFamily: FONT.reg },

  pressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  footerNote: {
    marginTop: 12,
    color: colors.footerOnDark,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
});
}

import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getToken } from "../src/auth/auth.store";

const BG = "#230b21"; // kullanıcı seçimi: mor-pembe arka plan
const TEXT = "rgba(252,252,253,0.96)"; // başlık ve ana metinler için açık ton
const MUTED = "rgba(226,232,240,0.82)"; // ikincil metinler için yumuşak açık gri
// SOFT / SOFT2 gelecekte kart kenarları vb. için kullanılabilir
const SOFT = "rgba(148,163,184,0.18)";
const SOFT2 = "rgba(148,163,184,0.10)";

// Fonts (works if you loaded Inter in _layout; otherwise system font shows)
const FONT = {
  title: "Inter_800ExtraBold",
  semi: "Inter_600SemiBold",
  reg: "Inter_400Regular",
};

type MoodKey = "calm" | "focused" | "happy" | "tired" | "anxious";

const MOODS: Record<
  MoodKey,
  { label: string; emoji: string; accent: string; accent2: string }
> = {
  // Yeşil yerine mor-pembe tonları
  calm: { label: "Sakin", emoji: "🌿", accent: "#c38ed4", accent2: "#f0b9e5" },
  focused: { label: "Odak", emoji: "🎯", accent: "#4b7c78", accent2: "#80a6a2" },
  happy: { label: "İyi", emoji: "☀️", accent: "#d9a66f", accent2: "#f3c58b" },
  tired: { label: "Yorgun", emoji: "🌙", accent: "#4B5563", accent2: "#9CA3AF" },
  anxious: { label: "Stresli", emoji: "⚡", accent: "#EF4444", accent2: "#FCA5A5" },
};

export default function Landing() {
  const router = useRouter();

  const [mood, setMood] = useState<MoodKey>("calm");

  // Soft floating animation for preview card
  const float = useRef(new Animated.Value(0)).current;

  // Background accent shift (subtle)
  const accentShift = useRef(new Animated.Value(0)).current;

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

    const shiftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(accentShift, {
          toValue: 1,
          duration: 7000,
          easing: Easing.linear,
          useNativeDriver: false, // backgroundColor
        }),
        Animated.timing(accentShift, {
          toValue: 0,
          duration: 7000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );

    floatLoop.start();
    shiftLoop.start();

    return () => {
      floatLoop.stop();
      shiftLoop.stop();
    };
  }, [router, float, accentShift]);

  const { accent, accent2 } = MOODS[mood];

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

  // Subtle animated blob color based on mood
  const blobStyle = useMemo(
    () => ({
      backgroundColor: accentShift.interpolate({
        inputRange: [0, 1],
        outputRange: [accent, accent2],
      }),
      opacity: 0.12,
    }),
    [accentShift, accent, accent2]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Background: minimal, mood-based accents */}
        <Animated.View pointerEvents="none" style={[styles.blob, styles.blob1, blobStyle]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.blob,
            styles.blob2,
            { backgroundColor: accent, opacity: 0.08 },
          ]}
        />
        <View pointerEvents="none" style={styles.darkOverlay} />

        {/* Brand row */}
        <View style={styles.topRow}>
          <View style={[styles.logoMark, { borderColor: "rgba(255,255,255,0.10)" }]}>
            <View style={[styles.logoDot, { backgroundColor: accent }]} />
          </View>
          <Text style={styles.brand}>OmniMind</Text>

          <View style={{ flex: 1 }} />
          <View style={[styles.moodPill, { borderColor: "rgba(255,255,255,0.10)" }]}>
            <Text style={styles.moodPillText}>
              {MOODS[mood].emoji} {MOODS[mood].label}
            </Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>Günlük • Ruh Hali • İçgörü</Text>

          <View style={styles.titleBox}>
            <Text style={[styles.titleGlow, { textShadowColor: accent }]}>Her şey akılda.</Text>
            <Text style={styles.title}>Her şey akılda.</Text>
            <View style={[styles.titleUnderline, { backgroundColor: accent }]} />
          </View>

          <Text style={styles.subtitle}>
            Gününü birkaç cümleyle kaydet. Ruh halini işaretle. Zamanla neyin iyi geldiğini gör.
          </Text>

          {/* Mood selector chips */}
          <View style={styles.moodsRow}>
            {(Object.keys(MOODS) as MoodKey[]).map((k) => {
              const active = k === mood;
              const m = MOODS[k];
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
                <Text style={[styles.previewTagText, { color: "rgba(255,255,255,0.85)" }]}>
                  {MOODS[mood].emoji} {MOODS[mood].label}
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
              { borderColor: "rgba(255,255,255,0.16)" },
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    overflow: "hidden",
  },

  blob: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 420,
  },
  blob1: { top: -240, left: -180 },
  blob2: { bottom: -260, right: -200 },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoDot: { width: 10, height: 10, borderRadius: 10 },
  brand: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    letterSpacing: 0.4,
    fontFamily: FONT.semi,
  },

  moodPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },
  moodPillText: { color: "rgba(255,255,255,0.80)", fontSize: 12, fontFamily: FONT.semi },

  hero: { marginTop: 25 },
  kicker: {
    color: "rgba(255,255,255,0.70)",
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
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: TEXT,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.4,
    fontFamily: FONT.title,
  },
  titleGlow: {
    position: "absolute",
    color: "rgba(255,255,255,0.92)",
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
    color: MUTED,
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: { color: "rgba(255,255,255,0.84)", fontSize: 12.5, fontFamily: FONT.semi },

  mid: { marginTop: 18, flex: 1, justifyContent: "center" },

  previewCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.55)",
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 10 },
    }),
  },
  previewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  previewTitle: { color: "rgba(255,255,255,0.88)", fontSize: 13, fontFamily: FONT.semi },
  previewTag: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  previewTagText: { fontSize: 12, fontFamily: FONT.semi },

  previewPrompt: { color: "rgba(255,255,255,0.70)", fontSize: 12.5, fontFamily: FONT.reg, marginBottom: 10 },

  previewNote: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 8 },
  previewBar: { width: 4, height: 44, borderRadius: 999, opacity: 0.9 },
  previewNoteTitle: { color: "rgba(255,255,255,0.90)", fontSize: 13.5, fontFamily: FONT.semi, letterSpacing: -0.2 },
  previewNoteBody: { marginTop: 4, color: "rgba(255,255,255,0.58)", fontSize: 12.5, lineHeight: 18, fontFamily: FONT.reg },

  previewDivider: { marginTop: 10, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },

  previewFooter: { marginTop: 12, flexDirection: "row", gap: 10 },
  miniStat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  miniStatTop: { fontSize: 16, fontFamily: FONT.title, letterSpacing: -0.4 },
  miniStatTop2: { color: "rgba(255,255,255,0.90)", fontSize: 15, fontFamily: FONT.title, letterSpacing: -0.4 },
  miniStatSub: { marginTop: 2, color: "rgba(255,255,255,0.55)", fontSize: 11.5, fontFamily: FONT.reg },

  actions: { paddingTop: 10 },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#42253f", // BG (#9e6e99) ile uyumlu, biraz daha koyu mor
  },
  primaryText: { color: "rgba(249,250,251,0.96)", fontSize: 16.5, fontFamily: FONT.title, letterSpacing: -0.2 },
  primaryHint: { color: "rgba(226,232,240,0.88)", fontSize: 12, marginTop: 4, fontFamily: FONT.reg },

  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: TEXT, fontSize: 16.5, fontFamily: FONT.title, letterSpacing: -0.2 },
  secondaryHint: { color: MUTED, fontSize: 12, marginTop: 4, fontFamily: FONT.reg },

  pressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },

  footerNote: {
    marginTop: 12,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
});

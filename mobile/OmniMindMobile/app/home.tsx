import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { BackgroundMesh } from "../components/BackgroundMesh";
import { CornerFloat3D } from "../components/CornerFloat3D";
import { useRouter } from "expo-router";
import { getToken, logout } from "../src/auth/auth.store";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../src/theme/colors";

function createHomeStyles(colors: ThemePalette) {
  return StyleSheet.create({
    loadingRoot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    safe: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 18,
      overflow: "hidden",
      justifyContent: "space-between",
    },
    main: { flexShrink: 0 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    themeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.white06,
      borderWidth: 1,
      borderColor: colors.white10,
    },
    themeBtnText: { fontSize: 15 },
    kicker: {
      color: colors.mutedOnDark,
      fontSize: 12.5,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      fontFamily: FONT.semi,
    },
    title: {
      marginTop: 10,
      color: colors.textOnDark,
      fontSize: 32,
      lineHeight: 36,
      letterSpacing: -0.6,
      fontFamily: FONT.title,
    },
    subtitle: {
      marginTop: 10,
      color: colors.mutedOnDark,
      fontSize: 14.2,
      lineHeight: 21,
      fontFamily: FONT.reg,
      maxWidth: 420,
    },
    journalBtn: {
      marginTop: 22,
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    journalBtnText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontFamily: FONT.title,
      letterSpacing: -0.2,
    },
    journalBtnHint: {
      marginTop: 4,
      color: colors.hintOnPrimary,
      fontSize: 12,
      fontFamily: FONT.reg,
    },
    pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    logoutBtn: {
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.white16,
    },
    logoutText: {
      color: colors.textOnDark,
      fontSize: 16,
      fontFamily: FONT.title,
      letterSpacing: -0.2,
    },
  });
}

export default function Home() {
  const router = useRouter();
  const { colors, isDark, toggleMode } = useOmniTheme();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={colors.spark} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        <BackgroundMesh accent={colors.primary} accent2={colors.accentDot} />

        <View style={styles.main}>
          <View style={styles.topBar}>
            <Text style={styles.kicker}>OmniMind</Text>
            <Pressable
              onPress={toggleMode}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
              style={styles.themeBtn}
            >
              <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Hoş geldin</Text>
          <Text style={styles.subtitle}>
            Günlüklerini yaz, ruh halini işaretle; ileride yapay zeka ve öneriler burada olacak.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.journalBtn, pressed && styles.pressed]}
            onPress={() => router.push("/journal")}
          >
            <Text style={styles.journalBtnText}>Günlüklerim</Text>
            <Text style={styles.journalBtnHint}>Kayıtlarını görüntüle veya yeni yaz</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          onPress={async () => {
            await logout();
            router.replace("/");
          }}
        >
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </Pressable>

        <CornerFloat3D accent={colors.primary} accent2={colors.accentDot} position="bottom-right" />
      </View>
    </SafeAreaView>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { BackgroundMesh } from "../components/BackgroundMesh";
import { CornerFloat3D } from "../components/CornerFloat3D";
import { getApiErrorMessage } from "../src/api/apiError";
import {
  getAccountPreferencesApi,
  updateAccountPreferencesApi,
} from "../src/api/preferences.api";
import type { AccountPreferences } from "../src/types/preferences";
import { getToken, logout } from "../src/auth/auth.store";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../src/theme/colors";

function createSettingsStyles(colors: ThemePalette) {
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
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 18,
      overflow: "hidden",
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 32 },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    backBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.white06,
      borderWidth: 1,
      borderColor: colors.white10,
    },
    backText: {
      color: colors.textOnDark,
      fontSize: 15,
      fontFamily: FONT.semi,
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
    title: {
      marginTop: 28,
      color: colors.textOnDark,
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: -0.5,
      fontFamily: FONT.title,
    },
    hint: {
      marginTop: 10,
      color: colors.mutedOnDark,
      fontSize: 14.2,
      lineHeight: 21,
      fontFamily: FONT.reg,
      maxWidth: 420,
    },
    section: { marginTop: 28 },
    sectionLabel: {
      color: colors.mutedOnDark,
      fontSize: 12,
      fontFamily: FONT.semi,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    prefRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
      gap: 12,
    },
    prefLabelWrap: { flex: 1, paddingRight: 8 },
    prefLabel: {
      color: colors.textOnDark,
      fontSize: 13.5,
      lineHeight: 20,
      fontFamily: FONT.reg,
    },
    logoutBtn: {
      marginTop: 28,
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
    deleteBtn: {
      marginTop: 12,
      paddingVertical: 10,
      alignItems: "center",
    },
    deleteText: {
      color: colors.error,
      fontSize: 15,
      fontFamily: FONT.semi,
      textDecorationLine: "underline",
    },
    pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleMode } = useOmniTheme();
  const styles = useMemo(() => createSettingsStyles(colors), [colors]);
  const [bootLoading, setBootLoading] = useState(true);
  const [prefs, setPrefs] = useState<AccountPreferences | null>(null);

  const loadPrefs = useCallback(async () => {
    const data = await getAccountPreferencesApi();
    setPrefs(data);
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        await loadPrefs();
      } catch (e) {
        Alert.alert("Yüklenemedi", getApiErrorMessage(e));
        setPrefs({
          allowAiJournalAnalysis: false,
          personalizedRecommendations: false,
        });
      } finally {
        setBootLoading(false);
      }
    })();
  }, [router, loadPrefs]);

  const persistPrefs = async (next: AccountPreferences) => {
    const prev = prefs;
    setPrefs(next);
    try {
      await updateAccountPreferencesApi(next);
    } catch (e) {
      if (prev) setPrefs(prev);
      Alert.alert("Kaydedilemedi", getApiErrorMessage(e));
    }
  };

  if (bootLoading || !prefs) {
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Geri"
            >
              <Text style={styles.backText}>← Geri</Text>
            </Pressable>
            <Pressable
              onPress={toggleMode}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Açık temaya geç" : "Karanlık temaya geç"}
              style={styles.themeBtn}
            >
              <Text style={styles.themeBtnText}>{isDark ? "☀️" : "🌙"}</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Ayarlar</Text>
          <Text style={styles.hint}>
            Tercihlerini güncellediğinde kayıt sunucuya hemen yazılır.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tercihler ve izinler</Text>
            <View style={styles.prefRow}>
              <View style={styles.prefLabelWrap}>
                <Text style={styles.prefLabel}>
                  Yapay zeka ile günlüklerimin analiz edilmesine izin ver
                </Text>
              </View>
              <Switch
                value={prefs.allowAiJournalAnalysis}
                onValueChange={(v) =>
                  void persistPrefs({ ...prefs, allowAiJournalAnalysis: v })
                }
                trackColor={{ false: colors.white16, true: colors.primary }}
                thumbColor={colors.cardBackground}
                ios_backgroundColor={colors.white16}
              />
            </View>
            <View style={styles.prefRow}>
              <View style={styles.prefLabelWrap}>
                <Text style={styles.prefLabel}>
                  Kişiselleştirilmiş öneri ve bildirimler al
                </Text>
              </View>
              <Switch
                value={prefs.personalizedRecommendations}
                onValueChange={(v) =>
                  void persistPrefs({ ...prefs, personalizedRecommendations: v })
                }
                trackColor={{ false: colors.white16, true: colors.primary }}
                thumbColor={colors.cardBackground}
                ios_backgroundColor={colors.white16}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Hesap</Text>
            <Pressable
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
              onPress={async () => {
                await logout();
                router.replace("/");
              }}
              accessibilityRole="button"
              accessibilityLabel="Çıkış yap"
            >
              <Text style={styles.logoutText}>Çıkış yap</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
              onPress={() => router.push("/account/delete")}
              accessibilityRole="button"
              accessibilityLabel="Hesabımı sil"
            >
              <Text style={styles.deleteText}>Hesabımı sil</Text>
            </Pressable>
          </View>
        </ScrollView>

        <CornerFloat3D accent={colors.primary} accent2={colors.accentDot} position="bottom-right" />
      </View>
    </SafeAreaView>
  );
}

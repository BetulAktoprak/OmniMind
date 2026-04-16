import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackgroundMesh } from "../components/BackgroundMesh";
import { useRouter } from "expo-router";
import { loginApi } from "../src/api/auth.api";
import { saveAuth } from "../src/auth/auth.store";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../src/theme/colors";

function createLoginStyles(colors: ThemePalette) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safe: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 18,
      overflow: "hidden",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      zIndex: 2,
      ...Platform.select({ android: { elevation: 6 } }),
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white12,
      borderWidth: 1,
      borderColor: colors.white10,
    },
    backText: {
      color: colors.textOnDark,
      fontSize: 16,
      fontFamily: FONT.semi,
    },
    brand: {
      color: colors.textOnDark,
      fontSize: 15,
      letterSpacing: 0.4,
      fontFamily: FONT.semi,
    },
    hero: {
      marginTop: 26,
    },
    kicker: {
      color: colors.mutedOnDark,
      fontSize: 12.5,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      fontFamily: FONT.semi,
    },
    title: {
      marginTop: 8,
      color: colors.textOnDark,
      fontSize: 32,
      lineHeight: 34,
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
    card: {
      marginTop: 26,
      borderRadius: 22,
      padding: 18,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    logoDot: {
      width: 16,
      height: 16,
      borderRadius: 999,
      backgroundColor: colors.accentDot,
    },
    cardTitle: {
      color: colors.labelOnLight,
      fontSize: 14,
      fontFamily: FONT.semi,
    },
    field: {
      marginTop: 10,
    },
    label: {
      color: colors.labelOnLight,
      fontSize: 12.5,
      marginBottom: 6,
      fontFamily: FONT.semi,
    },
    input: {
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
    error: {
      marginTop: 10,
      color: colors.error,
      fontSize: 12.5,
      fontFamily: FONT.semi,
    },
    primaryBtn: {
      marginTop: 18,
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    primaryDisabled: {
      opacity: 0.6,
    },
    primaryText: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontFamily: FONT.title,
      letterSpacing: -0.2,
    },
    secondaryBtn: {
      marginTop: 14,
      alignItems: "center",
    },
    secondaryText: {
      color: colors.textOnDark,
      fontSize: 13.5,
      fontFamily: FONT.semi,
    },
    secondaryHint: {
      marginTop: 2,
      color: colors.mutedOnDark,
      fontSize: 12,
      fontFamily: FONT.reg,
    },
    footerNote: {
      marginTop: 20,
      color: colors.footerOnDark,
      fontSize: 11.5,
      lineHeight: 16,
      textAlign: "center",
      fontFamily: FONT.reg,
    },
  });
}

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useOmniTheme();
  const styles = useMemo(() => createLoginStyles(colors), [colors]);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!login || !password || loading) return;
    setError(null);
    setLoading(true);
    try {
      const auth = await loginApi({ login, password });
      await saveAuth(auth);
      router.replace("/home");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Giriş başarısız. Bilgilerini kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <BackgroundMesh accent={colors.primary} accent2={colors.accentDot} />

          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.brand}>OmniMind</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.kicker}>Tekrar hoş geldin</Text>
            <Text style={styles.title}>Giriş yap</Text>
            <Text style={styles.subtitle}>
              Kaldığın yerden devam et. Günlüklerin ve ruh hali içgörülerin seni bekliyor.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.logoDot} />
              <Text style={styles.cardTitle}>Hesabınla giriş yap</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email veya kullanıcı adı</Text>
              <TextInput
                placeholder="ornek@mail.com"
                placeholderTextColor={colors.placeholderOnLight}
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.placeholderOnLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!login || !password || loading) && styles.primaryDisabled,
              ]}
              onPress={onLogin}
              disabled={!login || !password || loading}
            >
              <Text style={styles.primaryText}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.secondaryText}>Hesabın yok mu?</Text>
              <Text style={styles.secondaryHint}>Kayıt ol ve hemen başla</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            Giriş yaparak kullanım şartlarını ve gizlilik politikasını kabul etmiş olursun.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


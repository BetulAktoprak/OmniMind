import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { loginApi } from "../src/api/auth.api";
import { saveAuth } from "../src/auth/auth.store";

const BG = "#230b21"; // index ile aynı arka plan
const TEXT = "rgba(252,252,253,0.96)";
const MUTED = "rgba(226,232,240,0.82)";
const SOFT = "rgba(148,163,184,0.28)";

const FONT = {
  title: "Inter_800ExtraBold",
  semi: "Inter_600SemiBold",
  reg: "Inter_400Regular",
};

export default function Login() {
  const router = useRouter();
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
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.blob} />
          <View style={[styles.blob, styles.blob2]} />
          <View style={styles.darkOverlay} />

          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
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
                placeholderTextColor="rgba(255,255,255,0.35)"
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
                placeholderTextColor="rgba(255,255,255,0.35)"
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    backgroundColor: "rgba(195, 142, 212, 0.38)", // index'e yakın mor-pembe blob
    top: -260,
    left: -200,
  },
  blob2: {
    top: undefined,
    left: undefined,
    right: -220,
    bottom: -260,
    backgroundColor: "rgba(240, 185, 229, 0.26)",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148,163,184,0.18)",
  },
  backText: {
    color: TEXT,
    fontSize: 16,
    fontFamily: FONT.semi,
  },
  brand: {
    color: TEXT,
    fontSize: 15,
    letterSpacing: 0.4,
    fontFamily: FONT.semi,
  },
  hero: {
    marginTop: 26,
  },
  kicker: {
    color: MUTED,
    fontSize: 12.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: FONT.semi,
  },
  title: {
    marginTop: 8,
    color: TEXT,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.6,
    fontFamily: FONT.title,
  },
  subtitle: {
    marginTop: 10,
    color: MUTED,
    fontSize: 14.2,
    lineHeight: 21,
    fontFamily: FONT.reg,
    maxWidth: 420,
  },
  card: {
    marginTop: 26,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(252,252,253,0.96)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
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
    backgroundColor: "#c38ed4",
  },
  cardTitle: {
    color: "rgba(15,23,42,0.9)",
    fontSize: 14,
    fontFamily: FONT.semi,
  },
  field: {
    marginTop: 10,
  },
  label: {
    color: "rgba(15,23,42,0.9)",
    fontSize: 12.5,
    marginBottom: 6,
    fontFamily: FONT.semi,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: SOFT,
    backgroundColor: "#f3f4f6",
    color: "rgba(15,23,42,0.96)",
    fontFamily: FONT.reg,
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    color: "#FCA5A5",
    fontSize: 12.5,
    fontFamily: FONT.semi,
  },
  primaryBtn: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#593854",
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: "rgba(249,250,251,0.98)",
    fontSize: 16,
    fontFamily: FONT.title,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    marginTop: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: "rgba(15,23,42,0.94)",
    fontSize: 13.5,
    fontFamily: FONT.semi,
  },
  secondaryHint: {
    marginTop: 2,
    color: "rgba(71,85,105,0.9)",
    fontSize: 12,
    fontFamily: FONT.reg,
  },
  footerNote: {
    marginTop: 20,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
});

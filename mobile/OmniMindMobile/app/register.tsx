import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { registerApi } from "../src/api/auth.api";
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

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const [terms, setTerms] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [ai, setAi] = useState(false);
  const [share, setShare] = useState(false);
  const [ads, setAds] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function consents() {
    const list: string[] = [];
    if (terms) list.push("TermsOfService");
    if (privacy) list.push("PrivacyPolicy");
    if (ai) list.push("AIAnalysis");
    if (share) list.push("DataSharing");
    if (ads) list.push("PersonalizedAds");
    return list;
  }

  async function onRegister() {
    if (!email || !username || !password || !terms || !privacy || loading) return;
    setError(null);
    setLoading(true);
    try {
      const auth = await registerApi({
        email,
        username,
        password,
        displayName: displayName || undefined,
        consents: consents(),
      });
      await saveAuth(auth);
      router.replace("/home");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Kayıt başarısız. Bilgilerini kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = !email || !username || !password || !terms || !privacy || loading;

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
            <Text style={styles.kicker}>Yeni bir başlangıç</Text>
            <Text style={styles.title}>Hesap oluştur</Text>
            <Text style={styles.subtitle}>
              Günlüklerini, ruh halini ve içgörülerini tek yerde topla. Yakın gelecekte hepsi senin için anlam kazansın.
            </Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.logoDot} />
                <Text style={styles.cardTitle}>Temel bilgiler</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="ornek@mail.com"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Kullanıcı adı</Text>
                <TextInput
                  placeholder="omnimind_kullanici"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Görünen ad (opsiyonel)</Text>
                <TextInput
                  placeholder="Günlükte görünecek adın"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={displayName}
                  onChangeText={setDisplayName}
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

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Tercihler ve izinler</Text>

              <ConsentRow
                label="Kullanım şartlarını kabul ediyorum"
                value={terms}
                onChange={setTerms}
                required
              />
              <ConsentRow
                label="Gizlilik politikasını kabul ediyorum"
                value={privacy}
                onChange={setPrivacy}
                required
              />
              <ConsentRow
                label="Yapay zeka ile günlüklerimin analiz edilmesine izin ver"
                value={ai}
                onChange={setAi}
              />
              <ConsentRow
                label="Anonimleştirilmiş verilerimin ürün iyileştirmesi için kullanılmasına izin ver"
                value={share}
                onChange={setShare}
              />
              <ConsentRow
                label="Kişiselleştirilmiş öneri ve bildirimler al"
                value={ads}
                onChange={setAds}
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, disabled && styles.primaryDisabled]}
                onPress={onRegister}
                disabled={disabled}
              >
                <Text style={styles.primaryText}>
                  {loading ? "Oluşturuluyor..." : "Hesap Oluştur"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryText}>Zaten hesabın var mı?</Text>
                <Text style={styles.secondaryHint}>Giriş yap ve devam et</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerNote}>
              Zorunlu kutucukları işaretleyerek OmniMind kullanım şartlarını ve gizlilik politikasını kabul etmiş olursun.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConsentRow({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextBox}>
        <Text style={styles.rowLabel}>
          {label}
          {required ? " *" : ""}
        </Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
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
    backgroundColor: "rgba(195, 142, 212, 0.38)",
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
    fontSize: 30,
    lineHeight: 32,
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
  scroll: {
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
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
  divider: {
    marginTop: 18,
    marginBottom: 10,
    height: 1,
    backgroundColor: "rgba(15,23,42,0.12)",
  },
  sectionTitle: {
    color: "rgba(15,23,42,0.9)",
    fontSize: 13,
    fontFamily: FONT.semi,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rowTextBox: {
    flex: 1,
    paddingRight: 10,
  },
  rowLabel: {
    color: "rgba(30,41,59,0.92)",
    fontSize: 12.5,
    fontFamily: FONT.reg,
  },
  error: {
    marginTop: 12,
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
    marginTop: 12,
    color: "rgba(255,255,255,0.45)",
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
});

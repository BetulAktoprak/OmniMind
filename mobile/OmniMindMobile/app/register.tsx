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
import { colors, fonts as FONT } from "../src/theme/colors";

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
      <StatusBar barStyle="dark-content" />
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
                  placeholderTextColor={colors.placeholderOnLight}
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
                  placeholderTextColor={colors.placeholderOnLight}
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
                  placeholderTextColor={colors.placeholderOnLight}
                  value={displayName}
                  onChangeText={setDisplayName}
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
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.inputBorder, true: colors.primary }}
        thumbColor={colors.cardBackground}
        ios_backgroundColor={colors.inputBorder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  blob: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 420,
    backgroundColor: colors.blobTint,
    top: -260,
    left: -200,
  },
  blob2: {
    top: undefined,
    left: undefined,
    right: -220,
    bottom: -260,
    backgroundColor: colors.blobTint2,
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
    backgroundColor: colors.white12,
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
    fontSize: 30,
    lineHeight: 32,
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
  scroll: {
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
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
  divider: {
    marginTop: 18,
    marginBottom: 10,
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  sectionTitle: {
    color: colors.labelOnLight,
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
    color: colors.consentOnLight,
    fontSize: 12.5,
    fontFamily: FONT.reg,
  },
  error: {
    marginTop: 12,
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
    color: colors.textOnLight,
    fontSize: 13.5,
    fontFamily: FONT.semi,
  },
  secondaryHint: {
    marginTop: 2,
    color: colors.mutedOnLight,
    fontSize: 12,
    fontFamily: FONT.reg,
  },
  footerNote: {
    marginTop: 12,
    color: colors.footerOnDark,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: FONT.reg,
  },
});

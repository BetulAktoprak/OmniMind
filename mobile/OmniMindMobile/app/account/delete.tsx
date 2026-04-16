import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { BackgroundMesh } from "../../components/BackgroundMesh";
import { requestAccountDeletionApi } from "../../src/api/account.api";
import { getApiErrorMessage } from "../../src/api/apiError";
import { getToken, logout } from "../../src/auth/auth.store";
import { fonts as FONT, useOmniTheme, type ThemePalette } from "../../src/theme/colors";

function createStyles(colors: ThemePalette) {
  const danger = colors.error;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 18,
    },
    title: {
      color: colors.textOnDark,
      fontSize: 24,
      fontFamily: FONT.title,
      letterSpacing: -0.4,
    },
    body: {
      marginTop: 12,
      color: colors.mutedOnDark,
      fontSize: 14.5,
      lineHeight: 22,
      fontFamily: FONT.reg,
    },
    label: {
      marginTop: 22,
      color: colors.mutedOnDark,
      fontSize: 12,
      fontFamily: FONT.semi,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    input: {
      marginTop: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.white16,
      backgroundColor: colors.white06,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.textOnDark,
      fontSize: 16,
      fontFamily: FONT.reg,
    },
    dangerBtn: {
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: danger,
    },
    dangerText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: FONT.title,
    },
    cancelBtn: {
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.white16,
    },
    cancelText: {
      color: colors.textOnDark,
      fontSize: 16,
      fontFamily: FONT.title,
    },
    pressed: { opacity: 0.92 },
  });
}

export default function AccountDeleteScreen() {
  const router = useRouter();
  const { colors, isDark } = useOmniTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) router.replace("/login");
    })();
  }, [router]);

  const onSubmit = () => {
    if (!password.trim()) {
      Alert.alert("Parola", "Hesabınızı silmek için parolanızı girin.");
      return;
    }

    Alert.alert(
      "Hesabı kapat",
      "Hesabınız hemen kapatılır; günlükleriniz sunucuda belirlenen süre boyunca saklanır, ardından kalıcı silinir. Bu ekrandan sonra oturumunuz kapanır.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Onayla",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const res = await requestAccountDeletionApi({ password });
              await logout();
              Alert.alert("Tamam", res.message, [
                {
                  text: "Tamam",
                  onPress: () => router.replace("/"),
                },
              ]);
            } catch (e) {
              Alert.alert("İşlem başarısız", getApiErrorMessage(e));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BackgroundMesh accent={colors.primary} accent2={colors.accentDot} />
      <View style={styles.container}>
        <Text style={styles.title}>Hesabı sil</Text>
        <Text style={styles.body}>
          Parolanızı doğruladıktan sonra hesabınız kapatılır. Verileriniz yapılandırılan süre
          boyunca sunucuda tutulur, süre sonunda tamamen silinir.
        </Text>

        <Text style={styles.label}>Parola</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />

        <Pressable
          style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}
          onPress={onSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.dangerText}>Hesabımı kapat</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          disabled={busy}
        >
          <Text style={styles.cancelText}>Geri</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

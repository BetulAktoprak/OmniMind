import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getToken, logout } from "../src/auth/auth.store";
import { colors, fonts as FONT } from "../src/theme/colors";

export default function Home() {
  const router = useRouter();
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.blob} />
        <View style={[styles.blob, styles.blob2]} />

        <View style={styles.main}>
          <Text style={styles.kicker}>OmniMind</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  blob: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 380,
    backgroundColor: colors.blobTint,
    top: -200,
    right: -160,
  },
  blob2: {
    top: undefined,
    right: undefined,
    bottom: -220,
    left: -180,
    backgroundColor: colors.blobTint2,
  },
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type ViewStyle,
} from "react-native";
import * as Linking from "expo-linking";
import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from "expo-av";
import {
  fonts as FONT,
  useOmniTheme,
  type ThemePalette,
} from "../theme/colors";

function createMusicPlayerStyles(colors: ThemePalette) {
  return StyleSheet.create({
    wrap: { gap: 10 },
    wrapCompact: { marginTop: 4 },
    trackTitle: {
      color: colors.textOnLight,
      fontFamily: FONT.semi,
      fontSize: 15,
      lineHeight: 21,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      minWidth: 118,
      alignItems: "center",
      justifyContent: "center",
    },
    btnPreview: {
      backgroundColor: colors.primary,
    },
    btnPreviewText: {
      color: colors.textOnPrimary,
      fontFamily: FONT.semi,
      fontSize: 13,
    },
    btnOutline: {
      backgroundColor: colors.softSlate,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    btnOutlineText: {
      color: colors.textOnLight,
      fontFamily: FONT.semi,
      fontSize: 13,
    },
    btnDisabled: { opacity: 0.45 },
    btnPressed: { opacity: 0.88 },
    btnPressedOutline: { opacity: 0.92 },
    hint: {
      color: colors.mutedOnLight,
      fontFamily: FONT.reg,
      fontSize: 11.5,
      lineHeight: 16,
    },
  });
}
import { fetchItunesPreviewUrl } from "./fetchItunesPreviewUrl";

type UiState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "no_preview"
  | "error";

type Props = {
  trackLabel: string;
  /** Kart içi ek boşluk için (form önizlemesi) */
  compact?: boolean;
};

function spotifySearchUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return `https://open.spotify.com/search/${q}`;
}

function youtubeSearchUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return `https://www.youtube.com/results?search_query=${q}`;
}

export function MusicSuggestionPlayer({ trackLabel, compact }: Props) {
  const { colors } = useOmniTheme();
  const styles = useMemo(() => createMusicPlayerStyles(colors), [colors]);
  const [ui, setUi] = useState<UiState>("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
  const unloadAndIdleRef = useRef<() => Promise<void>>(async () => {});

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        /* yoksay */
      }
      soundRef.current = null;
    }
  }, []);

  const unloadAndIdle = useCallback(async () => {
    await unloadSound();
    setUi("idle");
  }, [unloadSound]);

  unloadAndIdleRef.current = unloadAndIdle;

  useEffect(() => {
    setUi("idle");
    return () => {
      void unloadSound();
    };
  }, [trackLabel, unloadSound]);

  const openSpotify = useCallback(async () => {
    await Linking.openURL(spotifySearchUrl(trackLabel));
  }, [trackLabel]);

  const openYouTube = useCallback(async () => {
    await Linking.openURL(youtubeSearchUrl(trackLabel));
  }, [trackLabel]);

  const onPlaybackStatusUpdate = useCallback((s: AVPlaybackStatus) => {
    if (!s.isLoaded) return;
    if (s.didJustFinish) {
      void unloadAndIdleRef.current();
    }
  }, []);

  const startPreview = useCallback(async () => {
    if (Platform.OS === "web") {
      await openSpotify();
      return;
    }

    setUi("loading");
    await unloadSound();

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const previewUrl = await fetchItunesPreviewUrl(trackLabel);
      if (!previewUrl) {
        setUi("no_preview");
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: previewUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setUi("playing");
    } catch {
      await unloadSound();
      setUi("error");
    }
  }, [onPlaybackStatusUpdate, openSpotify, trackLabel, unloadSound]);

  const onPressPreview = useCallback(async () => {
    if (Platform.OS === "web") {
      await openSpotify();
      return;
    }

    if (ui === "playing") {
      await soundRef.current?.pauseAsync();
      setUi("paused");
      return;
    }
    if (ui === "paused" && soundRef.current) {
      await soundRef.current.playAsync();
      setUi("playing");
      return;
    }
    if (ui === "error" || ui === "idle") {
      await startPreview();
    }
  }, [openSpotify, startPreview, ui]);

  const previewLabel =
    ui === "playing"
      ? "Duraklat"
      : ui === "paused"
        ? "Devam et"
        : ui === "loading"
          ? "…"
          : ui === "error"
            ? "Tekrar dene"
            : "Önizleme çal";

  const previewDisabled = ui === "loading" || !trackLabel.trim();

  const wrapStyle: ViewStyle[] = [styles.wrap];
  if (compact) wrapStyle.push(styles.wrapCompact);

  return (
    <View style={wrapStyle}>
      <Text style={styles.trackTitle} selectable>
        {trackLabel.trim()}
      </Text>

      <View style={styles.row}>
        {Platform.OS !== "web" && ui !== "no_preview" ? (
          <Pressable
            onPress={onPressPreview}
            disabled={previewDisabled}
            style={({ pressed }) => [
              styles.btn,
              styles.btnPreview,
              previewDisabled && styles.btnDisabled,
              pressed && !previewDisabled && styles.btnPressed,
            ]}
          >
            {ui === "loading" ? (
              <ActivityIndicator color={colors.textOnPrimary} size="small" />
            ) : (
              <Text style={styles.btnPreviewText}>{previewLabel}</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          onPress={openSpotify}
          style={({ pressed }) => [
            styles.btn,
            styles.btnOutline,
            pressed && styles.btnPressedOutline,
          ]}
        >
          <Text style={styles.btnOutlineText}>{"Spotify'da aç"}</Text>
        </Pressable>

        <Pressable
          onPress={openYouTube}
          style={({ pressed }) => [
            styles.btn,
            styles.btnOutline,
            pressed && styles.btnPressedOutline,
          ]}
        >
          <Text style={styles.btnOutlineText}>{"YouTube'da aç"}</Text>
        </Pressable>
      </View>

      {Platform.OS !== "web" ? (
        <Text style={styles.hint}>
          {ui === "no_preview"
            ? "Bu parça için katalogda kısa önizleme bulunamadı; tam dinleme için Spotify veya YouTube'u kullan."
            : "Uygulama içi dinleme Apple'ın ~30 sn önizlemesiyle çalışır (ücretsiz). Tam şarkı için Spotify veya YouTube'a yönlenebilirsin."}
        </Text>
      ) : (
        <Text style={styles.hint}>
          {
            "Web'de doğrudan önizleme yok; tam dinleme için Spotify veya YouTube araması açılır."
          }
        </Text>
      )}
    </View>
  );
}


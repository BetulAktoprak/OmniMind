import { Dimensions, StyleSheet, View } from "react-native";

type BackgroundMeshProps = {
  /** Üst-sağ “ışık” bloğu */
  accent: string;
  /** Alt-sol ikincil blok */
  accent2: string;
};

const screenW = Dimensions.get("window").width;

/**
 * Hafif eğik yuvarlatılmış dikdörtgenler — baloncuk yerine düz, modern arka plan.
 */
export function BackgroundMesh({ accent, accent2 }: BackgroundMeshProps) {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View
        style={[
          styles.block,
          {
            backgroundColor: accent,
            width: screenW * 1.08,
            height: 300,
            borderRadius: 52,
            top: -130,
            right: -screenW * 0.32,
            opacity: 0.1,
            transform: [{ rotate: "-10deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.block,
          {
            backgroundColor: accent2,
            width: screenW * 0.92,
            height: 240,
            borderRadius: 44,
            bottom: -72,
            left: -screenW * 0.26,
            opacity: 0.085,
            transform: [{ rotate: "8deg" }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  block: {
    position: "absolute",
  },
});

import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CornerFloat3DPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

/**
 * stack — katmanlı yuvarlatılmış kare (varsayılan)
 * ring — içi boş halka
 * orb — dolu daire + parlak leke
 * diamond — 45° dönmüş kare (elmas)
 * capsule — dikey hap
 * triangle — yukarı bakan üçgen
 */
export type CornerFloatShape = "stack" | "ring" | "orb" | "diamond" | "capsule" | "triangle";

type CornerFloat3DProps = {
  accent: string;
  accent2: string;
  position?: CornerFloat3DPosition;
  shape?: CornerFloatShape;
  size?: number;
};

export function CornerFloat3D({
  accent,
  accent2,
  position = "bottom-right",
  shape = "stack",
  size = 80,
}: CornerFloat3DProps) {
  const insets = useSafeAreaInsets();
  const wobble = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    wobble.value = withRepeat(
      withTiming(1, { duration: 4400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    bob.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [wobble, bob]);

  const shellStyle = useAnimatedStyle(() => {
    const ty = interpolate(bob.value, [0, 1], [5, -11]);
    const sc = interpolate(bob.value, [0, 1], [0.93, 1.06]);

    if (Platform.OS === "ios") {
      return {
        transform: [
          { perspective: 560 },
          { rotateY: `${interpolate(wobble.value, [0, 1], [-20, 20])}deg` },
          { rotateX: `${interpolate(bob.value, [0, 1], [-12, 12])}deg` },
          { translateY: ty },
          { scale: sc },
        ],
      };
    }

    const rz = interpolate(wobble.value, [0, 1], [-14, 14]);
    return {
      transform: [{ rotateZ: `${rz}deg` }, { translateY: ty }, { scale: sc }],
    };
  });

  const edge = {
    bottom: 12 + insets.bottom,
    right: 14 + insets.right,
    left: 14 + insets.left,
    top: 8 + insets.top,
  };

  const posStyle =
    position === "bottom-right"
      ? { bottom: edge.bottom, right: edge.right }
      : position === "bottom-left"
        ? { bottom: edge.bottom, left: edge.left }
        : position === "top-right"
          ? { top: edge.top, right: edge.right }
          : { top: edge.top, left: edge.left };

  const depth = 8;
  const box = size + depth;
  const r = Math.round(size * 0.26);
  const shadowIos = {
    shadowColor: "rgba(24, 40, 70, 0.2)" as const,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 } as const,
  };

  const inner = (() => {
    const wrap = (child: ReactNode) => (
      <View style={{ width: box, height: box, justifyContent: "center", alignItems: "center" }}>{child}</View>
    );

    if (shape === "stack") {
      return (
        <>
          <View
            style={[
              styles.abs,
              {
                right: 0,
                bottom: 0,
                width: size,
                height: size,
                borderRadius: r,
                backgroundColor: accent2,
                opacity: 0.52,
              },
            ]}
          />
          <View
            style={[
              styles.abs,
              {
                left: 0,
                top: 0,
                width: size,
                height: size,
                borderRadius: r,
                backgroundColor: accent,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: "rgba(255,255,255,0.42)",
                overflow: "hidden",
                ...(Platform.OS === "ios" ? shadowIos : { elevation: 10 }),
              },
            ]}
          >
            <View style={styles.shineRect} />
          </View>
        </>
      );
    }

    if (shape === "ring") {
      const s = size;
      return wrap(
        <View style={{ alignItems: "center", justifyContent: "center", width: box, height: box }}>
          <View
            style={{
              position: "absolute",
              width: s + 8,
              height: s + 8,
              borderRadius: (s + 8) / 2,
              borderWidth: 4,
              borderColor: `${accent2}44`,
            }}
          />
          <View
            style={{
              width: s,
              height: s,
              borderRadius: s / 2,
              borderWidth: Math.max(10, s * 0.19),
              borderColor: accent,
              backgroundColor: "transparent",
              ...(Platform.OS === "ios" ? shadowIos : { elevation: 8 }),
            }}
          />
        </View>
      );
    }

    if (shape === "orb") {
      const s = size;
      return wrap(
        <View style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              position: "absolute",
              width: s + 8,
              height: s + 8,
              borderRadius: (s + 8) / 2,
              backgroundColor: accent2,
              opacity: 0.42,
              transform: [{ translateX: 5 }, { translateY: 6 }],
            }}
          />
          <View
            style={{
              width: s,
              height: s,
              borderRadius: s / 2,
              backgroundColor: accent,
              overflow: "hidden",
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: "rgba(255,255,255,0.38)",
              ...(Platform.OS === "ios" ? { ...shadowIos, shadowRadius: 14 } : { elevation: 12 }),
            }}
          >
            <View
              style={{
                position: "absolute",
                top: s * 0.12,
                left: s * 0.14,
                width: s * 0.42,
                height: s * 0.34,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.26)",
              }}
            />
          </View>
        </View>
      );
    }

    if (shape === "diamond") {
      const d = size * 0.72;
      return wrap(
        <View style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              position: "absolute",
              width: d,
              height: d,
              backgroundColor: accent2,
              opacity: 0.48,
              borderRadius: 14,
              transform: [{ rotate: "45deg" }, { translateX: 6 }, { translateY: 6 }],
            }}
          />
          <View
            style={{
              width: d,
              height: d,
              backgroundColor: accent,
              borderRadius: 14,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: "rgba(255,255,255,0.4)",
              overflow: "hidden",
              transform: [{ rotate: "45deg" }],
              ...(Platform.OS === "ios" ? shadowIos : { elevation: 10 }),
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                width: "40%",
                height: "36%",
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.22)",
                transform: [{ rotate: "-45deg" }],
              }}
            />
          </View>
        </View>
      );
    }

    if (shape === "capsule") {
      const w = size * 0.46;
      const h = size * 1.02;
      return wrap(
        <View style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              position: "absolute",
              width: w + 6,
              height: h + 6,
              borderRadius: 999,
              backgroundColor: accent2,
              opacity: 0.45,
              transform: [{ translateX: 5 }, { translateY: 4 }],
            }}
          />
          <View
            style={{
              width: w,
              height: h,
              borderRadius: 999,
              backgroundColor: accent,
              overflow: "hidden",
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: "rgba(255,255,255,0.36)",
              ...(Platform.OS === "ios" ? shadowIos : { elevation: 10 }),
            }}
          >
            <View
              style={{
                position: "absolute",
                top: "14%",
                left: "20%",
                width: "52%",
                height: "26%",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.22)",
              }}
            />
          </View>
        </View>
      );
    }

    /* triangle */
    const half = size * 0.36;
    const bh = size * 0.62;
    return wrap(
      <View style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeftWidth: half + 2,
            borderRightWidth: half + 2,
            borderBottomWidth: bh + 4,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: accent2,
            opacity: 0.5,
            transform: [{ translateX: 5 }, { translateY: 5 }],
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: half,
            borderRightWidth: half,
            borderBottomWidth: bh,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: accent,
            ...(Platform.OS === "ios" ? { ...shadowIos, shadowRadius: 10 } : { elevation: 8 }),
          }}
        />
      </View>
    );
  })();

  return (
    <View
      pointerEvents="none"
      style={[styles.holder, posStyle, { width: box, height: box, zIndex: 4 }]}
    >
      <Animated.View style={[{ width: box, height: box }, shellStyle]}>{inner}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  holder: {
    position: "absolute",
  },
  abs: {
    position: "absolute",
  },
  shineRect: {
    position: "absolute",
    top: 10,
    left: 11,
    width: "44%",
    height: "34%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
});

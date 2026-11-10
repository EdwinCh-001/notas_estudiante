import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { useAppTheme } from '@/hooks';
import { auroraPalette } from '@/theme/tokens';

const FLOW_PATHS = [
  'M -60 190 C 40 90, 120 300, 225 190 C 300 110, 340 60, 450 120',
  'M -40 270 C 70 160, 120 390, 250 270 C 340 185, 390 150, 470 205',
  'M -80 430 C 55 310, 160 530, 290 410 C 380 330, 420 310, 480 340',
  'M -50 570 C 80 480, 180 670, 300 560 C 380 485, 430 460, 470 490',
  'M -60 730 C 90 630, 190 810, 310 700 C 390 625, 430 610, 480 650',
] as const;

/**
 * Static, GPU-friendly Flow Lines + Aurora Accent background.
 *
 * It is intentionally animation-free: a single vector tree rendered once per
 * screen keeps the UI smooth on low-end Android devices while still giving the
 * welcome/auth surfaces a distinctive, premium identity.
 */
export function FlowLinesBackground() {
  const { colorScheme, colors } = useAppTheme();
  const palette = auroraPalette[colorScheme];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.root}
    >
      <Svg
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 390 844"
        width="100%"
      >
        <Defs>
          <RadialGradient
            cx="0"
            cy="0"
            gradientUnits="userSpaceOnUse"
            id="auroraTop"
            r="300"
          >
            <Stop
              offset="0"
              stopColor={palette.violet}
              stopOpacity={palette.glowOpacity}
            />
            <Stop offset="1" stopColor={palette.violet} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            cx="0"
            cy="0"
            gradientUnits="userSpaceOnUse"
            id="auroraSide"
            r="320"
          >
            <Stop
              offset="0"
              stopColor={palette.blue}
              stopOpacity={palette.glowOpacity * 0.9}
            />
            <Stop offset="1" stopColor={palette.blue} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            cx="0"
            cy="0"
            gradientUnits="userSpaceOnUse"
            id="auroraBottom"
            r="340"
          >
            <Stop
              offset="0"
              stopColor={palette.teal}
              stopOpacity={palette.glowOpacity * 0.8}
            />
            <Stop offset="1" stopColor={palette.teal} stopOpacity={0} />
          </RadialGradient>

          <LinearGradient
            id="bottomFade"
            x1="0%"
            x2="0%"
            y1="0%"
            y2="100%"
          >
            <Stop
              offset="0"
              stopColor={colors.background}
              stopOpacity={0}
            />
            <Stop
              offset="1"
              stopColor={colors.background}
              stopOpacity={0.94}
            />
          </LinearGradient>
        </Defs>

        <Circle cx="60" cy="120" fill="url(#auroraTop)" r="300" />
        <Circle cx="390" cy="380" fill="url(#auroraSide)" r="320" />
        <Circle cx="190" cy="790" fill="url(#auroraBottom)" r="340" />

        <G
          fill="none"
          opacity={palette.lineOpacity}
          strokeLinecap="round"
          strokeWidth={1.1}
        >
          {FLOW_PATHS.map((path, index) => (
            <Path
              d={path}
              key={path}
              stroke={
                index % 3 === 0
                  ? palette.violet
                  : index % 3 === 1
                    ? palette.blue
                    : palette.teal
              }
            />
          ))}
        </G>

        <G fill={palette.teal} opacity={palette.lineOpacity * 1.8}>
          <Circle cx="225" cy="190" r="2.4" />
          <Circle cx="290" cy="410" r="2.2" />
          <Circle cx="300" cy="560" r="2" />
        </G>

        <Rect
          fill="url(#bottomFade)"
          height="264"
          width="390"
          x="0"
          y="580"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
});

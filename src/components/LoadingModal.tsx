import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import StarSetting from '../assets/svgs/StarSetting';
import Starts from '../assets/svgs/starts';
import Textt from './Textt';

const SPLASH_BG = '#09101D';
const SPINNER_SIZE = 48;
const MODAL_SPINNER_SIZE = 56;

export type LoadingVariant = 'splash' | 'modal' | 'generating';

export interface LoadingModalProps {
  visible: boolean;
  text?: string;
  /** 'splash' = full-screen dark purple + white spinner (SplashScreen). 'modal' = white box + purple spinner (SignIn/SignUp). 'generating' = white box + star icon + text (AiGenerating). */
  variant?: LoadingVariant;
}

function useRotation(durationMs: number = 1000) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [durationMs, rotation]);
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return rotate;
}

/** White ring with illuminated segment that fades – for splash (image 1). Exported for use inside SplashScreen. */
export function SplashSpinner() {
  const rotate = useRotation(1200);
  const size = SPINNER_SIZE;
  const strokeWidth = 3;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const visibleLength = circumference * 0.35;
  const gapLength = circumference - visibleLength;
  return (
    <Animated.View style={[styles.spinnerWrap, { width: size, height: size, transform: [{ rotate }] }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${visibleLength} ${gapLength}`}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

/** Purple gradient ring – for modal (image 2). */
function ModalSpinner() {
  const rotate = useRotation(1000);
  const size = MODAL_SPINNER_SIZE;
  const strokeWidth = 4;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const visibleLength = circumference * 0.3;
  const gapLength = circumference - visibleLength;
  return (
    <Animated.View style={[styles.spinnerWrap, { width: size, height: size, transform: [{ rotate }] }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="modalSpinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5B2C6F" />
            <Stop offset="50%" stopColor="#7C1C76" />
            <Stop offset="100%" stopColor="#BD51B7" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#modalSpinnerGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${visibleLength} ${gapLength}`}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

export default function LoadingModal({
  visible,
  text = 'Generating plan...',
  variant = 'modal',
}: LoadingModalProps) {
  if (!visible) return null;

  if (variant === 'splash') {
    return (
      <Modal transparent visible statusBarTranslucent>
        <View style={[styles.overlay, styles.splashOverlay]}>
          <SplashSpinner />
        </View>
      </Modal>
    );
  }

  if (variant === 'generating') {
    return (
      <Modal transparent visible statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.box}>
            <View style={styles.starWrap}>
              <Starts width={56} height={56} fill={lightColors.background} />
            </View>
            <Text style={styles.text}>{text}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ModalSpinner />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: lightColors.blurBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashOverlay: {
    backgroundColor: SPLASH_BG,
  },
  box: {
    backgroundColor: lightColors.secondaryBackground,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  spinnerWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starWrap: {
    marginBottom: 4,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fontFamilies.urbanist,
    color: lightColors.text,
  },
});

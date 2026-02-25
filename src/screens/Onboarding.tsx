import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import type { RootStackParamList } from '../navigations/RootNavigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const ONBOARDING_IMAGES = [
  require('../assets/images/Onborading1.png') as ImageSourcePropType,
  require('../assets/images/Onborading2.png') as ImageSourcePropType,
  require('../assets/images/Onborading3.png') as ImageSourcePropType,
];

type Slide = {
  title: string;
  titleBold?: string;
  titleAfterBold?: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    title: 'Meet Taskify - Your Goal Conquering Sidekick!',
    description:
      'Embark on a journey of achievement and transformation with Taskify. Say hello to a more organized, productive, and fulfilled you.',
  },
  {
    title: 'Track Your Progress, and Achieve Your Dreams!',
    description:
      'Stay focused on your goals and watch your dreams come true. Taskify empowers you to track progress every step of the way.',
  },
  {
    title: 'Unlock Your ',
    titleBold: 'AI-Powered',
    titleAfterBold: ' Goals Planner Now!',
    description:
      "Tap into the genius of AI and unlock a world of endless possibilities. Achieving your goals has never been more intuitive and efficient.",
  },
];

const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const colors = getColors(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = SLIDES.length;
  const isLastSlide = currentIndex === totalSlides - 1;
  const slide = SLIDES[currentIndex];

  const handleContinue = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      navigation.navigate('WelcomeScreen' as never as keyof RootStackParamList);
    }
  };

  const handleSkip = () => {
    navigation.navigate('ThemeTest');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: palette.white,
        },
      ]}
    >
      <View style={[styles.topSection, { backgroundColor: palette.orange }]}>
        <Image
          source={ONBOARDING_IMAGES[currentIndex]}
          style={[styles.previewImage, { width: Math.min(400, width - 48), height: 650 }]}
          resizeMode="contain"
        />
        <View style={styles.bottomCurve}>
          <Svg height={80} width={width} viewBox={`0 0 ${width} 80`}>
            <Path
              d={`M0 0 Q${width / 2} 80 ${width} 0 L${width} 80 L0 80 Z`}
              fill="white"
            />
          </Svg>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.black, fontFamily: fontFamilies.urbanistBold }]}>
          <Text style={[styles.title, { color: palette.black, fontFamily: fontFamilies.urbanistBold }]}>
          {slide.titleBold ? (
            [
              <Text key="1" style={[styles.title, { color: palette.black, fontFamily: fontFamilies.urbanistBold }]}>{slide.title}</Text>,
              <Text key="2" style={[styles.title, styles.titleBold]}>{slide.titleBold}</Text>,
              <Text key="3" style={[styles.title, { color: palette.black, fontFamily: fontFamilies.urbanistBold }]}>{slide.titleAfterBold}</Text>,
            ]
          ) : (
            slide.title
          )}
        </Text>
        </Text>
        <Text style={[styles.description, { color: colors.subText, fontFamily: fontFamilies.urbanist }]}>
          {slide.description}
        </Text>

        <View style={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttons}>
        {!isLastSlide && (
          <Button
            title="Skip"
            variant="outline"
            onPress={handleSkip}
            style={styles.skipButton}
          />
        )}
        <Button
          title={isLastSlide ? "Let's Get Started" : 'Continue'}
          variant="primary"
          onPress={handleContinue}
          style={isLastSlide ? { ...styles.continueButton, ...styles.continueButtonFull } : styles.continueButton}
        />
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    // height: 580,
    // width: '100%',
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingVertical: 24,

    height: '60%',
    position: 'relative',
    zIndex: 2,
    
  },
  previewImage: {
    // paddingTop: 100,
    // height: 580,
    // maxWidth: '100%',
    // zIndex: 1,

    width: 300,
    height: 1000,
    marginTop: 55,
    marginLeft: 'auto',
    marginRight: 'auto',
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24, 
    paddingBottom: 16,
    // justifyContent: 'flex-end',
    zIndex: 2,
    backgroundColor: 'white',
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 30,
    lineHeight: 44,
    marginBottom: 12,
    textAlign: 'center',
  },
  titleBold: {
    fontFamily: fontFamilies.urbanistBold,
  },
  description: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 24,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: palette.accent,
    width: 32,
  },
  dotInactive: {
    backgroundColor: palette.gray300,
  },
  buttons: {
    
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
paddingHorizontal: 24,
   
    
   
  },
  skipButton: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 0,
    backgroundColor: palette.skipbg,
  },
  continueButton: {
    flex: 1.2,
    borderRadius: 100,
  },
  continueButtonFull: {
    flex: 1,
  },
  bottomCurve: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: palette.divider,
    marginVertical: 24,
  },
});
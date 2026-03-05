import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import Button from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useTranslation } from '../i18n';

const CONFETTI_COLORS = ['#1A96F0', '#FE7A36', '#12D18E', '#E53935', '#EA1E61', '#64B5F6', '#1565C0'];
const STAR_COLOR = '#FFD54F';

const TrophyImage = require('../assets/images/Trophy.png');

const CONFETTI_ITEMS = [
  { left: 8, top: 40, w: 10, h: 6, color: '#1A96F0', rot: 15 },
  { left: 72, top: 24, w: 8, h: 5, color: '#FE7A36', rot: -20 },
  { left: 88, top: 80, w: 12, h: 7, color: '#12D18E', rot: 45 },
  { left: 16, top: 120, w: 7, h: 4, color: '#EA1E61', rot: -35 },
  { left: 44, top: 28, w: 9, h: 5, color: '#64B5F6', rot: 70 },
  { left: 92, top: 140, w: 8, h: 5, color: '#1565C0', rot: -10 },
  { left: 28, top: 180, w: 11, h: 6, color: '#E53935', rot: 25 },
  { left: 80, top: 200, w: 6, h: 4, color: '#12D18E', rot: -50 },
  { left: 4, top: 220, w: 9, h: 5, color: '#EA1E61', rot: 12 },
  { left: 56, top: 60, w: 8, h: 5, color: '#1A96F0', rot: -30 },
  { left: 36, top: 260, w: 10, h: 6, color: '#FE7A36', rot: 80 },
  { left: 96, top: 280, w: 7, h: 4, color: '#64B5F6', rot: -15 },
];

const STAR_POSITIONS = [
  { left: '10%', top: 40 },
  { left: '26%', top: 70 },
  { left: '42%', top: 35 },
  { left: '58%', top: 65 },
  { left: '76%', top: 45 },
  { left: '90%', top: 85 },
];

function ConfettiLayer() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFETTI_ITEMS.map((item, i) => (
        <View
          key={i}
          style={[
            styles.confettiPiece,
            {
              left: `${item.left}%`,
              top: item.top,
              width: item.w,
              height: item.h,
              backgroundColor: item.color,
              transform: [{ rotate: `${item.rot}deg` }],
            },
          ]}
        />
      ))}
      {STAR_POSITIONS.map((pos, i) => (
        <Text key={`star-${i}`} style={[styles.star, { left: pos.left, top: pos.top }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const GoalAchievedScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const handleOkSure = () => {
    navigation.navigate('MainTabs' as never, { screen: 'My Goals', params: { initialFilter: 'achieved' } } as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top,  paddingBottom: 10}]}>
      <ConfettiLayer />

      <View style={styles.content}>
        <Image source={TrophyImage} style={styles.trophy} resizeMode="contain" />
        <Text style={styles.title}>Goal Achieved!</Text>
        <Text style={styles.message}>
          You have successfully achieved your goal.{'\n'}
          Keep up the incredible effort!
        </Text>
      </View>

      <Button
        title={t('okSure') as string}
        onPress={handleOkSure}
        variant="primary"
        style={styles.okButton}
      />
    </View>
  );
};

export default GoalAchievedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.secondaryBackground,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  trophy: {
    width: 382,
    height: 328,
    marginBottom: 42,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 32,
    color: lightColors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {

    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.subText,
    textAlign: 'center',
    lineHeight: 28,
    // paddingHorizontal: 24,
  },
  okButton: {
    marginBottom: 24,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
  star: {
    position: 'absolute',
    fontSize: 20,
    color: STAR_COLOR,
  },
});

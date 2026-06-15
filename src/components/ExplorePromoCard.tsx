import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export interface ExplorePromoCardProps {
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = 'Explore thousands of amazing goals today!';
const DEFAULT_SUBTITLE = 'Make your dreams come true with the power of AI';

const ExplorePromoCard: React.FC<ExplorePromoCardProps> = ({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.illustrationWrap}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotSmall]} />
        <View style={[styles.dot, styles.dotMedium]} />
      </View>
    </View>
  );
};

export default ExplorePromoCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightColors.background,
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 24,
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 16,
    // minHeight: 120,
  },
  textWrap: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.secondaryBackground,
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  illustrationWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 12,
    right: 8,
  },
  dotMedium: {
    width: 8,
    height: 8,
    borderRadius: 4,
    bottom: 20,
    right: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import UpGradeSetting from '../assets/svgs/upGradeSetting';

export type UpgradePlanBannerProps = {
  /** Main CTA text, e.g. "Upgrade Plan Now!" */
  title?: string;
  /** Subtitle below the title */
  subtitle?: string;
  onPress?: () => void;
};

const DEFAULT_TITLE = 'Upgrade Plan Now!';
const DEFAULT_SUBTITLE = 'Enjoy all the benefits and explore more possibilities';

const UpgradePlanBanner: React.FC<UpgradePlanBannerProps> = ({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.iconCircle}>
        <UpGradeSetting width={60} height={60} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: lightColors.background,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  iconCircle: {
    // width: 60,
    // height: 60,
    // borderRadius: 28,
    // // backgroundColor: lightColors.secondaryBackground,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.secondaryBackground,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default UpgradePlanBanner;

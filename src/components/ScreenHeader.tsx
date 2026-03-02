import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpashLogo from '../assets/svgs/SpashLogo';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export type ScreenHeaderProps = {
  /** Title shown in the center */
  title: string;
  /** Called when the right menu (ellipsis) is pressed */
  onMenuPress?: () => void;
  /** Color for the logo; defaults to app primary */
  logoColor?: string;
  /** Color for the menu icon */
  menuIconColor?: string;
};

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onMenuPress,
  logoColor = lightColors.background,
  menuIconColor = lightColors.smallText,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <SpashLogo fill={logoColor} width={28} height={28} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={menuIconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: lightColors.secondaryBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.smallText,
  },
  menuButton: {
    padding: 6,
  },
});

export default ScreenHeader;

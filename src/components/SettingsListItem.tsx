import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import ArrowSetting from '../assets/svgs/ArrowSetting';

export type SettingsListItemProps = {
  /** Ionicons name for the left icon (used when icon is not provided) */
  iconName?: string;
  /** Custom icon component (takes precedence over iconName) */
  icon?: React.ReactNode;
  /** Label text */
  label: string;
  onPress?: () => void;
  /** If true, label and icon use accent (e.g. purple for Logout) */
  accent?: boolean;
  /** Hide the right chevron */
  showArrow?: boolean;
  /** Optional custom icon color */
  iconColor?: string;
};

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  iconName,
  icon,
  label,
  onPress,
  accent = false,
  showArrow = true,
  iconColor,
}) => {
  const color = accent ? lightColors.background : lightColors.smallText;
  const iconColorResolved = iconColor ?? color;

  const content = (
    <>
      {icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : iconName ? (
        <Ionicons name={iconName} size={22} color={iconColorResolved} style={styles.icon} />
      ) : null}
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
      {showArrow && (
        <ArrowSetting width={20} height={20} color={lightColors.text} />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    
  },
  icon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.smallText,
  },
  labelAccent: {
    color: lightColors.background,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
});

export default SettingsListItem;

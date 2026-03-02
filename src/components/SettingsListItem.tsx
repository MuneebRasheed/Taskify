import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
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
  /** Optional subtitle below the label */
  subtitle?: string;
  onPress?: () => void;
  /** If true, label and icon use accent (e.g. purple for Logout) */
  accent?: boolean;
  /** Hide the right chevron */
  showArrow?: boolean;
  /** Optional value text shown on the right (e.g. "Light", "English (US)") */
  value?: string;
  /** Optional custom icon color */
  iconColor?: string;
  /** Optional style for the row container */
  style?: ViewStyle;
};

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  iconName,
  icon,
  label,
  subtitle,
  onPress,
  accent = false,
  showArrow = true,
  value,
  iconColor,
  style,
}) => {
  const color = accent ? lightColors.accent : lightColors.text;
  const iconColorResolved = iconColor ?? color;

  const content = (
    <>
      {(icon || iconName) ? (
        <View style={styles.iconWrapper}>
          {icon ?? (iconName ? <Ionicons name={iconName} size={22} color={iconColorResolved} /> : null)}
        </View>
      ) : null}
      <View style={styles.labelBlock}>
        <View style={styles.titleRow}>
          <Text style={[styles.label, accent && styles.labelAccent]} numberOfLines={1}>{label}</Text>
          {value != null && (
            <Text style={styles.valueText} numberOfLines={1}>{value}</Text>
          )}
          {showArrow && (
            <View style={styles.arrowWrap}>
              <ArrowSetting width={24} height={24} color={lightColors.text} />
            </View>
          )}
        </View>
        {subtitle ? (
          <View style={styles.subtitleWrap}> 
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.row, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    // paddingHorizontal: 4,
    
  },
  iconWrapper: {
    marginRight: 12,
  },
  labelBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    marginRight: 8,
  },
  arrowWrap: {
    marginLeft: 4,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.subText,
    lineHeight: 24,
  },
  labelAccent: {
    color: lightColors.accent,
    fontFamily: fontFamilies.urbanistBold,
  },
  valueText: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.subText,
    marginRight: 8,
  },
  subtitleWrap: {
    alignSelf: 'stretch',
  },
});

export default SettingsListItem;

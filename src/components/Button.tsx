import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export type ButtonVariant = 'primary' | 'outline';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style' | 'children'> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Container style props (override defaults)
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  minHeight?: number;

  // Text color (overrides variant default)
  textColor?: string;
  loadingColor?: string;

  // Inner layout
  contentStyle?: ViewStyle;
  sideWidth?: number;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  backgroundColor,
  borderColor,
  borderWidth,
  borderRadius,
  paddingVertical,
  paddingHorizontal,
  minHeight,
  textColor,
  loadingColor,
  contentStyle,
  sideWidth,
  ...rest
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  const computedBackground =
    backgroundColor ??
    (isPrimary ? palette.accent : palette.white);

  const computedBorderColor =
    borderColor ??
    (variant === 'outline' ? palette.accent : 'transparent');

  const computedBorderWidth =
    borderWidth ?? (variant === 'outline' ? 1 : 0);

  const computedTextColor =
    textColor ??
    (isPrimary ? palette.white : palette.accent);

  const computedLoadingColor =
    loadingColor ?? computedTextColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: computedBackground,
          borderColor: computedBorderColor,
          borderWidth: computedBorderWidth,
          borderRadius: borderRadius ?? 1000,
          paddingVertical: paddingVertical ?? 16,
          paddingHorizontal: paddingHorizontal ?? 16,
          minHeight: minHeight ?? 58,
        },
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={computedLoadingColor}
          size="small"
        />
      ) : (
        <View style={[styles.row, contentStyle]}>
          <View style={[styles.side, sideWidth != null && { width: sideWidth }]}>{leftIcon}</View>

          <View style={styles.center}>
            <Text
              style={[
                styles.text,
                isPrimary ? styles.primaryText : styles.outlineText,
                { color: computedTextColor },
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>

          <View style={[styles.side, sideWidth != null && { width: sideWidth }]}>{rightIcon}</View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 1000,
    minHeight: 58,
    justifyContent: 'center',
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  side: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
  },

  primaryText: {
    color: palette.white,
  },

  outlineText: {
    color: palette.accent,
  },

  disabledText: {
    color: palette.gray500,
  },
});
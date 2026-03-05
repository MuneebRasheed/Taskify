import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const SIDE_WIDTH = 40;

export interface HeaderProps {
  /** Left-side content (e.g. logo or back icon). */
  leftIcon: React.ReactNode;
  /** Center title (string or component e.g. Textt). */
  title: React.ReactNode;
  /** Right-side content (e.g. menu or more icon). */
  rightIcon: React.ReactNode;
  /** If provided, left icon is wrapped in TouchableOpacity with this handler. */
  onLeftPress?: () => void;
  /** If provided, right icon is wrapped in TouchableOpacity with this handler. */
  onRightPress?: () => void;
  /** Optional container style (e.g. add borderBottom). */
  style?: ViewStyle;
  /** Optional title text style when title is a string. */
  titleStyle?: TextStyle;
}

const Header: React.FC<HeaderProps> = ({
  leftIcon,
  title,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const titleNode =
    typeof title === 'string' ? (
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    ) : (
      title
    );

  const renderSide = (
    content: React.ReactNode,
    onPress?: () => void
  ) => {
    const wrapperStyle = styles.sideWrap;
    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={wrapperStyle}
          hitSlop={HIT_SLOP}
          activeOpacity={0.7}
        >
          {content}
        </TouchableOpacity>
      );
    }
    return <View style={wrapperStyle}>{content}</View>;
  };

  return (
    <View style={[styles.container, style]} collapsable={false}>
      {renderSide(leftIcon, onLeftPress)}
      <View style={styles.titleContainer}>{titleNode}</View>
      {renderSide(rightIcon, onRightPress)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,

  },
  sideWrap: {
    width: SIDE_WIDTH,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.smallText,
    textAlignVertical: 'center',
  },
});

export default Header;

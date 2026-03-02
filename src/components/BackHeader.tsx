import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export type BackHeaderProps = {
  title: string;
  onBack: () => void;
};

const BackHeader: React.FC<BackHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <BackArrowIcon width={24} height={24} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.BtnBackground,
    minHeight: 56,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.smallText,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
});

export default BackHeader;

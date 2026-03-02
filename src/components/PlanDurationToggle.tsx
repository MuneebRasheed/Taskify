import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export type PlanDuration = 'monthly' | 'yearly';

export type PlanDurationToggleProps = {
  value: PlanDuration;
  onChange: (value: PlanDuration) => void;
  monthlyLabel: string;
  yearlyLabel: string;
};

const PlanDurationToggle: React.FC<PlanDurationToggleProps> = ({
  value,
  onChange,
  monthlyLabel,
  yearlyLabel,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, value === 'monthly' && styles.tabActive]}
        onPress={() => onChange('monthly')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            value === 'monthly' && styles.tabTextActive,
          ]}
        >
          {monthlyLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, value === 'yearly' && styles.tabActive]}
        onPress={() => onChange('yearly')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            value === 'yearly' && styles.tabTextActive,
          ]}
        >
          {yearlyLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: lightColors.background,
  },
  tabText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.text,
  },
  tabTextActive: {
    fontFamily: fontFamilies.urbanistSemiBold,
    color: lightColors.secondaryBackground,
  },
});

export default PlanDurationToggle;

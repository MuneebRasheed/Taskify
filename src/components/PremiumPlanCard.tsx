import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

export type PremiumPlanCardProps = {
  planName: string;
  price: string;
  periodLabel: string;
  features: string[];
  /** Show "Save X%" badge when set (e.g. 17 for yearly) */
  savePercent?: number;
  /** When set, show "Your current plan" at bottom of card with top border */
  currentPlanLabel?: string;
};

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  planName,
  price,
  periodLabel,
  features,
  savePercent,
  currentPlanLabel,
}) => {
  return (
    <View style={styles.card}>
      {savePercent != null ? (
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>Save {savePercent}%</Text>
        </View>
      ) : null}
      <Text style={styles.planName}>{planName}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>{periodLabel}</Text>
      </View>
      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name="checkmark"
              size={24}
              color={lightColors.smallText}
              style={styles.checkIcon}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      {currentPlanLabel != null ? (
        <TouchableOpacity
          style={styles.currentPlanWrap}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View style={styles.currentPlanBorder} />
          <Text style={styles.currentPlanText}>{currentPlanLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  saveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: lightColors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 1,
  },
  saveBadgeText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 13,
    color: lightColors.secondaryBackground,
  },
  planName: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.smallText,
    marginBottom: 8,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 20,
  },
  price: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 32,
    color: lightColors.smallText,
    marginRight: 4,
  },
  period: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.subText,
  },
  featuresList: {},
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
 
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.smallText,
    lineHeight: 24,
  },
  currentPlanWrap: {
    marginTop: 5,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanBorder: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    height: 1,
    backgroundColor: lightColors.border,
  },
  currentPlanText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 20,
    color: lightColors.subText,
    marginTop: 5,
  },
});

export default PremiumPlanCard;

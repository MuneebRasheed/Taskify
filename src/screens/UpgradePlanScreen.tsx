import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import PlanDurationToggle, { type PlanDuration } from '../components/PlanDurationToggle';
import PremiumPlanCard from '../components/PremiumPlanCard';
import Button from '../components/Button';
import { RootStackParamList } from '../navigations/RootNavigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UpgradePlanScreen'>;

const MONTHLY_PRICE = '$4.99';
const YEARLY_PRICE = '$49.99';

const UpgradePlanScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const [duration, setDuration] = useState<PlanDuration>('monthly');
  const [showCurrentPlan, setShowCurrentPlan] = useState(false);

  const features = useMemo(
    () => [
      t('featureAdFree'),
      t('featureUnlimitedGoals'),
      t('featureAdvancedTracking'),
      t('featureTemplates'),
      t('featureAI'),
      t('featureSupport'),
    ],
    [t]
  );

  const price = duration === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
  const periodLabel = duration === 'monthly' ? t('perMonth') : t('perYear');
  const continueLabel =
    duration === 'monthly' ? t('continuePrice') : t('continuePriceYearly');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('upgradePlan')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleWrap}>
          <PlanDurationToggle
            value={duration}
            onChange={setDuration}
            monthlyLabel={t('monthly')}
            yearlyLabel={t('yearly')}
          />
        </View>

        <View style={styles.cardWrap}>
          <PremiumPlanCard
            planName={t('taskifyPremium')}
            price={price}
            periodLabel={periodLabel}
            features={features}
            savePercent={duration === 'yearly' ? 17 : undefined}
            currentPlanLabel={showCurrentPlan ? t('yourCurrentPlan') : undefined}
          />
        </View>

        {showCurrentPlan ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('subscriptionExpiresOn')}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{t('renewOrCancelPrefix')}</Text>
              <Pressable onPress={() => {}}>
                <Text style={styles.footerLink}>{t('renewOrCancelLink')}</Text>
              </Pressable>
              <Text style={styles.footerText}>{t('renewOrCancelSuffix')}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      {!showCurrentPlan ? (
        <View style={styles.buttonWrap}>
          <Button
            title={continueLabel}
            onPress={() => setShowCurrentPlan(true)}
            variant="primary"
            backgroundColor={lightColors.accent}
            style={styles.button}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.BtnBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 24,
  },
  toggleWrap: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  cardWrap: {
    marginBottom: 24,
  },
  buttonWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    padding: 30,
    backgroundColor: lightColors.secondaryBackground,
  },
  button: {},
  footer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.subText,
  },
  footerLink: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.accent,
  },
});

export default UpgradePlanScreen;

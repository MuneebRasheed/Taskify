import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, ActivityIndicator } from 'react-native';
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
import { useOfferingsStore } from '../../store/offeringsStore';
import { purchasePackage } from '../lib/purchasesService';
import type { PurchasesPackage } from 'react-native-purchases';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UpgradePlanScreen'>;

const UpgradePlanScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const [duration, setDuration] = useState<PlanDuration>('monthly');
  const [showCurrentPlan, setShowCurrentPlan] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const { offerings, isLoading, refreshPurchasesData } = useOfferingsStore();

  useEffect(() => {
    refreshPurchasesData();
  }, [refreshPurchasesData]);

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

  // Get the selected package based on duration
  const selectedPackage = useMemo(() => {
    if (!offerings?.all) return null;
    
    if (duration === 'monthly') {
      // Access: offerings.all.monthly.monthly
      const monthlyOffering = offerings.all.monthly;
      return monthlyOffering?.monthly ?? null;
    } else {
      // Access: offerings.all.yearly.annual
      const yearlyOffering = offerings.all.yearly;
      return yearlyOffering?.annual ?? null;
    }
  }, [offerings, duration]);

  // Debug logging
  useEffect(() => {
    if (offerings) {
      console.log('[UpgradePlanScreen] Offerings loaded:', {
        hasMonthly: !!offerings.all?.monthly,
        hasYearly: !!offerings.all?.yearly,
        monthlyPrice: offerings.all?.monthly?.monthly?.product?.priceString,
        yearlyPrice: offerings.all?.yearly?.annual?.product?.priceString,
      });
    }
  }, [offerings]);

  useEffect(() => {
    console.log('[UpgradePlanScreen] Selected package:', {
      duration,
      hasPackage: !!selectedPackage,
      price: selectedPackage?.product?.priceString,
      identifier: selectedPackage?.identifier,
    });
  }, [selectedPackage, duration]);

  // Extract price and period information
  const price = selectedPackage?.product?.priceString ?? (duration === 'monthly' ? 'Rs 1,300.00' : 'Rs 12,900.00');
  const periodLabel = duration === 'monthly' ? t('perMonth') : t('perYear');
  
  // Dynamic continue button label with actual price
  const continueLabel = useMemo(() => {
    if (selectedPackage?.product?.priceString) {
      return `${t('continue')} - ${selectedPackage.product.priceString}`;
    }
    return duration === 'monthly' ? t('continuePrice') : t('continuePriceYearly');
  }, [selectedPackage, duration, t]);
  
  // Calculate savings for yearly plan
  const savePercent = useMemo(() => {
    if (duration === 'yearly' && offerings?.all?.monthly && offerings?.all?.yearly) {
      const monthlyPrice = offerings.all.monthly.monthly?.product?.price ?? 0;
      const yearlyPrice = offerings.all.yearly.annual?.product?.price ?? 0;
      
      if (monthlyPrice > 0 && yearlyPrice > 0) {
        const yearlyEquivalent = monthlyPrice * 12;
        const savings = ((yearlyEquivalent - yearlyPrice) / yearlyEquivalent) * 100;
        return Math.round(savings);
      }
    }
    return undefined;
  }, [duration, offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      console.warn('No package selected');
      return;
    }

    setIsPurchasing(true);
    try {
      const customerInfo = await purchasePackage(selectedPackage as PurchasesPackage);
      if (customerInfo) {
        setShowCurrentPlan(true);
        // Refresh offerings to get updated customer info
        await refreshPurchasesData();
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      // You might want to show an error alert here
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('upgradePlan')}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lightColors.accent} />
          <Text style={styles.loadingText}>{t('loadingOfferings') || 'Loading offerings...'}</Text>
        </View>
      ) : (
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
              savePercent={savePercent}
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
      )}
      {!showCurrentPlan && !isLoading ? (
        <View style={styles.buttonWrap}>
          <Button
            title={isPurchasing ? (t('processing') || 'Processing...') : continueLabel}
            onPress={handlePurchase}
            variant="primary"
            backgroundColor={lightColors.accent}
            style={styles.button}
            disabled={isPurchasing || !selectedPackage}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.subText,
  },
});

export default UpgradePlanScreen;

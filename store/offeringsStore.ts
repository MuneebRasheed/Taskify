import { create } from 'zustand';
import type { CustomerInfo } from 'react-native-purchases';
import { getOfferings } from '../src/lib/purchasesService';

type RevenueCatOfferings = NonNullable<Awaited<ReturnType<typeof getOfferings>>>;

type OfferingsState = {
  offerings: RevenueCatOfferings | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  hasLoadedOnce: boolean;
  error: string | null;
  setCustomerInfo: (customerInfo: CustomerInfo | null) => void;
  refreshPurchasesData: () => Promise<void>;
  resetPurchasesState: () => void;
};

function hasActiveEntitlement(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export const useOfferingsStore = create<OfferingsState>()((set) => ({
  offerings: null,
  customerInfo: null,
  isLoading: false,
  hasLoadedOnce: false,
  error: null,

  setCustomerInfo: (customerInfo) => set({ customerInfo }),

  refreshPurchasesData: async () => {
    set({ isLoading: true, error: null });
    try {
      const offerings = await getOfferings();
      const monthlyPlusOffering = offerings?.all?.monthly_plus;
      const yearlyProOffering = offerings?.all?.yearly_pro;
      const selectedPackages = [
        ...(monthlyPlusOffering?.availablePackages ?? []),
        ...(yearlyProOffering?.availablePackages ?? []),
      ];

      console.log('[RevenueCat] selected offerings identifiers:', ['monthly_plus', 'yearly_pro']);
      console.log('[RevenueCat] monthly_plus found:', !!monthlyPlusOffering);
      console.log('[RevenueCat] yearly_pro found:', !!yearlyProOffering);
      console.log(
        '[RevenueCat] selected offering packages:',
        selectedPackages.map((pkg) => ({
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          productId: pkg.product.identifier,
          priceString: pkg.product.priceString,
        }))
      );
      set({
        offerings,
        isLoading: false,
        hasLoadedOnce: true,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        hasLoadedOnce: true,
        error: error?.message ?? 'Failed to load purchases data',
      });
    }
  },

  resetPurchasesState: () =>
    set({
      offerings: null,
      customerInfo: null,
      isLoading: false,
      hasLoadedOnce: false,
      error: null,
    }),
}));

export const selectHasActiveEntitlement = (state: OfferingsState): boolean =>
  hasActiveEntitlement(state.customerInfo);

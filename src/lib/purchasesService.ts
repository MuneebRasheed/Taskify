import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesPackage,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

const IOS_REVENUECAT_API_KEY = 'appl_CpCpLjSgNyXHtsQKgdKOgbNdpAh';

let isConfigured = false;
type RevenueCatOfferings = Awaited<ReturnType<typeof Purchases.getOfferings>>;

function isIOSPurchasesEnabled() {
  return Platform.OS === 'ios';
}

export async function configureRevenueCat(): Promise<void> {
  if (!isIOSPurchasesEnabled() || isConfigured) return;
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  Purchases.configure({ apiKey: IOS_REVENUECAT_API_KEY });
  isConfigured = true;
}

export async function getOfferings(): Promise<RevenueCatOfferings | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  return Purchases.getOfferings();
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  return Purchases.getCustomerInfo();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return null;
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  return Purchases.restorePurchases();
}

export async function syncRevenueCatUserIdentity(
  appUserId: string,
  email?: string | null
): Promise<CustomerInfo | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  const { customerInfo } = await Purchases.logIn(appUserId);
  if (email) {
    await Purchases.setAttributes({ $email: email });
  }
  return customerInfo;
}

export async function logOutRevenueCat(): Promise<CustomerInfo | null> {
  if (!isIOSPurchasesEnabled()) return null;
  await configureRevenueCat();
  return Purchases.logOut();
}

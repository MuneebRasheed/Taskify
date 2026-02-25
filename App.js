import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Urbanist_100Thin,
  Urbanist_200ExtraLight,
  Urbanist_300Light,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  Urbanist_900Black,
  Urbanist_100Thin_Italic,
  Urbanist_200ExtraLight_Italic,
  Urbanist_300Light_Italic,
  Urbanist_400Regular_Italic,
  Urbanist_500Medium_Italic,
  Urbanist_600SemiBold_Italic,
  Urbanist_700Bold_Italic,
  Urbanist_800ExtraBold_Italic,
  Urbanist_900Black_Italic,
} from '@expo-google-fonts/urbanist';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { getColors } from './utils/colors';
import RootNavigation from './src/navigations/RootNavigation';
import { useLanguageStore } from './store/languageStore';
import { setI18nLocale } from './src/i18n';
const fontMap = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Urbanist_100Thin,
  Urbanist_200ExtraLight,
  Urbanist_300Light,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  Urbanist_900Black,
  Urbanist_100Thin_Italic,
  Urbanist_200ExtraLight_Italic,
  Urbanist_300Light_Italic,
  Urbanist_400Regular_Italic,
  Urbanist_500Medium_Italic,
  Urbanist_600SemiBold_Italic,
  Urbanist_700Bold_Italic,
  Urbanist_800ExtraBold_Italic,
  Urbanist_900Black_Italic,
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [languageHydrated, setLanguageHydrated] = useState(false);
  const colors = getColors(false); // light mode only

  useEffect(() => {
    const applyStoredLanguage = () => {
      const { locale, isRTL } = useLanguageStore.getState();
      I18nManager.forceRTL(!!isRTL);
      I18nManager.allowRTL(true);
      setI18nLocale(locale);
      setLanguageHydrated(true);
    };
    const unsub = useLanguageStore.persist.onFinishHydration(applyStoredLanguage);
    const t = setTimeout(applyStoredLanguage, 1500);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!languageHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
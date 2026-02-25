import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import SpashLogo from '../assets/svgs/SpashLogo';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const colors = getColors(false); // light mode only
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  ;
useEffect(() => {
  setTimeout(() => {
    // navigation.navigate('LanguageTestScreen');
    navigation.navigate('Onboarding');
  }, 2000);
}, []);
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <SpashLogo fill={palette.white} width={160} height={160} />
      <Text style={[styles.text, { color: colors.text, fontFamily: fontFamilies.urbanistBold }]}>SplashScreen</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginTop: 24,
  },
});

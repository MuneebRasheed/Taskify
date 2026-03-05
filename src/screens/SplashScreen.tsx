import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import SpashLogo from '../assets/svgs/SpashLogo';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 2000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: lightColors.background }]}>
      <Image source={require('../assets/images/MainLogo.png')} style={{ width: 304, height: 386 }} />
    
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

import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';
import { useAuth } from '../lib/auth/AuthProvider';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const t = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: session ? 'MainTabs' : 'WelcomeScreen' }],
      });
    }, 2000);

    return () => clearTimeout(t);
  }, [navigation, session, isLoading]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: lightColors.background }]}>
      <Image source={require('../assets/images/MainLogo.png')} style={styles.logo} />
      <ActivityIndicator 
        size="large" 
        color={lightColors.accent} 
        style={styles.spinner}
      />
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
  logo: {
    width: 304,
    height: 386,
  },
  spinner: {
    marginTop: 24,
  },
});

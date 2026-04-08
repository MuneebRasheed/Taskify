import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { lightColors, palette } from "../../utils/colors";
import SpashLogo from "../assets/svgs/SpashLogo";
import GoogleIcon from "../assets/svgs/GoogleIcon";
import AppleIcon from "../assets/svgs/AppleIcon";
import { fontFamilies } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigations/RootNavigation";
import Textt from "../components/Textt";
import { useTranslation } from "../i18n";
import { useAuth } from "../lib/auth/AuthProvider";

const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleGoogleSignIn = async () => {
    const { data, error } = await signInWithGoogle();
    if (error) {
      alert(error.message ?? "Google sign in failed");
      return;
    }
    if (data) {
      navigation.navigate("MainTabs");
    }
  };

  const handleAppleSignIn = async () => {
    const { data, error } = await signInWithApple();
    if (error) {
      alert(error.message ?? "Apple sign in failed");
      return;
    }
    if (data) {
      navigation.navigate("MainTabs");
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground }]}>

        <View style={styles.logoContainer}>
      <SpashLogo fill={lightColors.background} width={80} height={80} />
    </View>

    <View style={styles.heading}>  
        <Textt i18nKey="letsGetStarted" style={[styles.title, { fontFamily: fontFamilies.urbanistBold }]} />
        <Textt i18nKey="letsDiveIn" style={styles.description} />
    </View>

    <View style={styles.formContainer}>
      <Button
        style={styles.button}
        title={t('continueWithGoogle')}
        variant="outline"
        backgroundColor={palette.white}
        borderColor={palette.gray300}
        borderWidth={1}
        borderRadius={1000}
        textColor={palette.black}
        leftIcon={<GoogleIcon width={24} height={24} />}
        onPress={handleGoogleSignIn}
      />
      <Button
        style={styles.button}
        title={t('continueWithApple')}
        variant="outline"
        backgroundColor={palette.white}
        borderColor={palette.gray300}
        borderWidth={1}
        borderRadius={1000}
        textColor={palette.black}
        leftIcon={<AppleIcon width={24} height={24} />}
        onPress={handleAppleSignIn}
      />
    </View>

    <View style={styles.footer}>
      <Button
        title={t('signUp')}
        variant="primary"
        textColor={palette.white}
        borderRadius={1000}
        onPress={() => {navigation.navigate('SignUpScreen' as never as keyof RootStackParamList)}}
      />
      <Button
        title={t('signIn')}
        variant="primary"
        borderRadius={1000}
        backgroundColor={lightColors.skipbg}
        textColor={lightColors.background}
        onPress={() => {navigation.navigate('SignInScreen' as never as keyof RootStackParamList)}}
      />

    </View>

    <View style={styles.footerText}>
      <Textt i18nKey="privacyPolicy" style={styles.footerT1} />
      <Text style={styles.footerT2} >.</Text>
      <Textt i18nKey="termsOfService" style={styles.footerT3} />
    </View>
    <TouchableOpacity
      style={styles.testLink}
      onPress={() => navigation.navigate('LanguageTestScreen' as never)}
    >
      <Textt i18nKey="testLanguage" style={styles.testLinkText} />
    </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,

      alignItems: 'center',
    },
    logoContainer: {
    
      marginTop: 40,
    },
    heading: {
     marginTop: 87,
      gap: 4 ,
   

  
    },
    title:{
        fontFamily: fontFamilies.urbanistBold,
        fontSize: 24,
        lineHeight: 32,
        
        textAlign: 'center',
        
    },
    description:{
      marginTop: 12,
        fontFamily: fontFamilies.urbanist,
        fontSize: 16,
        lineHeight: 24,
        
        textAlign: 'center',
    },
    formContainer: {
      gap: 16,
      width: '100%',
      paddingHorizontal: 24,
      marginTop: 87,
      
    },
    button: {
      // width: '100%',
    },
    footer: {
        marginTop: 87,
        width: '100%',
        paddingHorizontal: 24,
        gap: 20,
      },
      footerText: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 50,
      },
      footerT1: {
        fontFamily: fontFamilies.urbanist,
        fontSize: 14,
        lineHeight: 16,
      },
      footerT2: {
        fontFamily: fontFamilies.urbanist,
        fontSize: 14,
        lineHeight: 16,
      },
      footerT3: {
        fontFamily: fontFamilies.urbanist,
        fontSize: 14,
        lineHeight: 16,
      },
      testLink: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      testLinkText: {
        fontFamily: fontFamilies.urbanist,
        fontSize: 12,
        color: palette.primary,
      },
    });
    
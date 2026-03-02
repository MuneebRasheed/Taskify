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

const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground }]}>

        <View style={styles.logoContainer}>
      <SpashLogo fill={lightColors.background} width={80} height={80} />
    </View>

    <View style={styles.heading}>  
        <Text style={[styles.title, { fontFamily: fontFamilies.urbanistBold }]}>Let's Get Started!</Text>
        <Text style={styles.description}>Let's dive in into your account</Text>
    </View>

    <View style={styles.formContainer}>
      <Button
        style={styles.button}
        title="Continue with Google"
        variant="outline"
        backgroundColor={palette.white}
        borderColor={palette.gray300}
        borderWidth={1}
        borderRadius={24}
        textColor={palette.black}
        leftIcon={<GoogleIcon width={24} height={24} />}
        onPress={() => {}}
      />
      <Button
        style={styles.button}
        title="Continue with Apple"
        variant="outline"
        backgroundColor={palette.white}
        borderColor={palette.gray300}
        borderWidth={1}
        borderRadius={24}
        textColor={palette.black}
        leftIcon={<AppleIcon width={24} height={24} />}
        onPress={() => {}}
      />
    </View>

    <View style={styles.footer}>
      <Button
        title="Sign Up"
        variant="primary"
        textColor={palette.white}
        borderRadius={24}
        onPress={() => {navigation.navigate('SignUpScreen' as never as keyof RootStackParamList)}}
      />
      <Button
        title="Sign In"
        variant="primary"
        borderRadius={24}
        backgroundColor={lightColors.skipbg}
        textColor={lightColors.background}
        onPress={() => {navigation.navigate('SignInScreen' as never as keyof RootStackParamList)}}
      />

    </View>

    <View style={styles.footerText}>
      <Text style={styles.footerT1}>Privacy Policy</Text>
      <Text style={styles.footerT2}>.</Text>
      <Text style={styles.footerT3}>Terms of Service</Text>
    </View>
    <TouchableOpacity
      style={styles.testLink}
      onPress={() => navigation.navigate('LanguageTestScreen' as never)}
    >
      <Text style={styles.testLinkText}>Test language (EN / AR RTL)</Text>
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
        marginTop: 60,
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
    
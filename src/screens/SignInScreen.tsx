import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
  } from "react-native";
  import { useState } from "react";
  import { Feather } from "@expo/vector-icons";
  import { lightColors, palette } from "../../utils/colors";
  import { fontFamilies } from "../theme/typography";
  import { useSafeAreaInsets } from "react-native-safe-area-context";
  import { NavigationProp, useNavigation } from "@react-navigation/native";
  import { RootStackParamList } from "../navigations/RootNavigation";
  import InputField from "../components/Login";
  import Button from "../components/Button";
  import GoogleIcon from "../assets/svgs/GoogleIcon";
  import AppleIcon from "../assets/svgs/AppleIcon";
  import LoadingModal from "../components/LoadingModal";
  import EmailIcon from "../assets/svgs/EmailIcon";
  import PasswordIcon from "../assets/svgs/PasswordIcon";
  import CheckIcon from "../assets/svgs/CheckIcon";
  import BackArrowIcon from "../assets/svgs/BackArrowIcon";
  
  const SignInScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = () => {
        if (!agreed) {
          alert("Please accept Remember me");
          return;
        }
    
        setLoading(true);
    
        setTimeout(() => {
          setLoading(false);
          navigation.navigate('HomeScreen');
        }, 2000);
      };
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: lightColors.background },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <BackArrowIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
  
            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
              Welcome Back! 👋
              </Text>
              <Text style={styles.subtitle}>
              Sign in to access your goals, habits, and progress.
              </Text>
            </View>
  
            {/* Form */}
            <View style={styles.form}>
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                leftIcon={<EmailIcon width={20} height={20} />}
              />
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                showPasswordToggle
                leftIcon={<PasswordIcon width={20} height={20} />}
              />
  
              {/* Terms */}
              <View style={styles.termsRow} >
                <View style={{flexDirection: 'row', alignItems: 'center'  }}>


                
               
                <TouchableOpacity
                  onPress={() => setAgreed((a) => !a)}
                  style={[styles.checkbox, agreed && styles.checkboxChecked]}
                  activeOpacity={0.8}
                >
                  {agreed && (
                    <CheckIcon width={12} height={9} />
                  )}
                </TouchableOpacity>
               
                <Text style={styles.termsText}>
                  Remember me{" "}</Text> </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                
                 
                  <Pressable onPress={() => {}}>
                    <Text style={styles.link}>Forgot password?</Text>
                  </Pressable>
                  </View>
                
              </View>
  
              
  
              {/* Separator */}
              <View style={styles.separatorWrap}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separatorLine} />
              </View>
  
              {/* Social buttons */}
              <Button
                style={styles.socialButton}
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
                style={styles.socialButton}
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
  
              {/* Primary CTA */}
             
           
           
            
              </View>
          </KeyboardAvoidingView>
        </ScrollView>
         <View style={styles.signInButtonWrap}>
        <Button
                style={styles.signInButton}
                title="Sign In"
                variant="primary"
                textColor={palette.white}
                borderRadius={24}
                onPress={handleSignup}
              />
              </View>
        <LoadingModal visible={loading} text="Sign in..." />
      </View>
    );
  };
  
  export default SignInScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    keyboardView: {
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 20,
      // paddingBottom: 16,
    },
    backButton: {
      paddingVertical: 20,
      width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    },
    titleBlock: {
      marginTop: 20,
    },
    title: {
      fontFamily: fontFamilies.urbanistBold,
      fontSize: 32,
      lineHeight: 44,
      color: lightColors.text,
    },
    sparkle: {
      fontSize: 20,
    },
    subtitle: {
      marginTop: 8,
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    lineHeight: 28,
    color: lightColors.subText,
    },
    form: {
      marginTop: 25,
      gap: 16,
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 24,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 3,
      borderColor: lightColors.textButtonOrange,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      borderColor: lightColors.textButtonOrange,
    },
    termsText: {
      flexShrink: 1,
      fontFamily: fontFamilies.urbanist,
      fontSize: 18,
      color: palette.arrowLeft,
    },
    link: {
      fontFamily: fontFamilies.urbanist,
      fontSize: 18,
     
      color: lightColors.textButtonOrange,
    },
    
    separatorWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 28,
      marginBottom: 16,
      gap: 16,
    },
    separatorLine: {
      
      flex: 1,
      height: 1,
      backgroundColor: lightColors.border,
    },
    separatorText: {
      fontFamily: fontFamilies.urbanist,
      fontSize: 15,
      color: lightColors.subText,
    },
    socialButton: {
      // marginTop: 16,
      width: "100%",
      borderRadius: 1000,
    },
    signInButtonWrap: {
      paddingHorizontal: 24,
    
      width: "100%",
      borderWidth: 1,
      borderColor: lightColors.border,
    },
    signInButton: {
      borderRadius: 1000,
    width: "100%",
    marginTop: 20,
    marginBottom: 30,
    },
  });
  
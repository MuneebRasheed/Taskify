import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
  Keyboard,
  } from "react-native";
  import { useEffect, useState } from "react";
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
  import Header from "../components/Header";
  import { useTranslation } from "../i18n";
import { useAuth } from "../lib/auth/AuthProvider";

  const SignInScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { signIn } = useAuth();
    const [email, setEmail] = useState("jupyter6699@gmail.com");
    const [password, setPassword] = useState("hello123");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    useEffect(() => {
      const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

      const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
      const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const handleSignIn = async () => {
      const nextErrors: { email?: string; password?: string } = {};
      if (!email.trim()) nextErrors.email = "This is mandatory";
      if (!password) nextErrors.password = "This is mandatory";
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setLoading(true);
      const { data, error } = await signIn(email.trim(), password);
      setLoading(false);

      if (error) {
        alert(error.message ?? "Sign in failed");
        return;
      }
      if (data) {
        navigation.navigate("MainTabs");
      }
    };
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground },
        ]}
      >
        <Header
          leftIcon={<BackArrowIcon width={24} height={24} />}
          onLeftPress={() => navigation.goBack()}
          title={<View />}
          rightIcon={<View />}
          style={styles.header}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={false}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
              {t('welcomeBack')} 👋
              </Text>
              <Text style={styles.subtitle}>
              {t('signInToAccessYourGoals')}
              </Text>
            </View>
  
            {/* Form */}
            <View style={styles.form}>
              <InputField
                label={t('email')}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email && v.trim()) setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder={t('email')}
                leftIcon={<EmailIcon width={20} height={20} />}
                errorText={errors.email ?? null}
              />
              <InputField
                label={t('password')}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password && v) setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder={t('password')}
                secureTextEntry
                showPasswordToggle
                leftIcon={<PasswordIcon width={20} height={20} />}
                errorText={errors.password ?? null}
              />
  
              {/* Terms */}
              <View style={styles.termsRow}>
                <View style={styles.termsLeft}>
                  <TouchableOpacity
                    onPress={() => setAgreed((a) => !a)}
                    style={[styles.checkbox, agreed && styles.checkboxChecked]}
                    activeOpacity={0.8}
                  >
                    {agreed && (
                      <CheckIcon width={12} height={9} fill={lightColors.secondaryBackground} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.termsText}>{t('rememberMe')}</Text>
                </View>
                <View style={styles.termsRight}>
                  <Pressable onPress={() => navigation.navigate('ForgotPasswordEmail')}>
                    <Text style={styles.link}>{t('forgotPassword')}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.separatorWrap}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>{t('or')}</Text>
                <View style={styles.separatorLine} />
              </View>
  
              {/* Social buttons */}
              <Button
                style={styles.socialButton}
                title={t('continueWithGoogle')}
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
                title={t('continueWithApple')}
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
          </ScrollView>
        </KeyboardAvoidingView>
        {!keyboardVisible && (
          <View style={styles.signInButtonWrap}>
            <Button
              style={styles.signInButton}
              title={t("signIn")}
              variant="primary"
              textColor={palette.white}
              borderRadius={24}
              onPress={handleSignIn}
            />
          </View>
        )}
        <LoadingModal visible={loading} variant="modal" text={t('signingIn')} />
      </View>
    );
  };
  
  export default SignInScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 12,
    },
    header: {
      paddingVertical: 0,
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
    termsLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    termsRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 3,
      borderColor: lightColors.background,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: lightColors.background,
    },
    termsText: {
      flexShrink: 1,
      fontFamily: fontFamilies.urbanist,
      fontSize: 18,
      color: lightColors.smallText,
    },
    link: {
      fontFamily: fontFamilies.urbanist,
      fontSize: 18,
     
      color: lightColors.background,
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
  
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
import BackArrowIcon from "../assets/svgs/BackArrowIcon";
import Header from "../components/Header";
import EmailIcon from "../assets/svgs/EmailIcon";
import PasswordIcon from "../assets/svgs/PasswordIcon";
import CheckIcon from "../assets/svgs/CheckIcon";
import { useTranslation } from "../i18n";
import { useAuth } from "../lib/auth/AuthProvider";

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; agreed?: string }>({});

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

  const handleSignup = async () => {
    const nextErrors: { email?: string; password?: string; agreed?: string } = {};
    if (!agreed) nextErrors.agreed = "This is mandatory";
    if (!email.trim()) nextErrors.email = "This is mandatory";
    if (!password) nextErrors.password = "This is mandatory";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      alert(error.message ?? "Sign up failed");
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
        title=""
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
            Join Taskify Today ✨
            </Text>
            <Text style={styles.subtitle}>
              Create your account and unlock a world of productivity.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email && v.trim()) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="andrew.ainsley@yourdomain.com"
              leftIcon={<EmailIcon width={20} height={20} />}
              errorText={errors.email ?? null}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password && v) setErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="••••••••"
              secureTextEntry
              showPasswordToggle
              leftIcon={<PasswordIcon width={20} height={20} />}
              errorText={errors.password ?? null}
            />

            {/* Terms */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() =>
                  setAgreed((a) => {
                    const next = !a;
                    if (next && errors.agreed) setErrors((p) => ({ ...p, agreed: undefined }));
                    return next;
                  })
                }
                style={[styles.checkbox, agreed && styles.checkboxChecked]}
                activeOpacity={0.8}
              >
                {agreed && (
                  <CheckIcon width={12} height={9} fill={lightColors.secondaryBackground}/>
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                {t('iAgreeToTaskify')} {" "}
                <Text style={styles.link} onPress={() => {}}>
                  {t('termsAndConditions')}
                </Text>
              </Text>
            </View>
            {!!errors.agreed && <Text style={styles.inlineError}>{errors.agreed}</Text>}

            <View style={styles.signInRow}>
              <Text style={styles.signInPrompt}>{t('alreadyHaveAnAccount')} </Text>
              <Pressable onPress={() => navigation.navigate("WelcomeScreen")}>
                <Text style={styles.link}>{t('signIn')}</Text>
              </Pressable>
            </View>

            {/* Separator */}
            <View style={styles.separatorWrap}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialButtonsWrap}>
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
            {/* Primary CTA */}
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!keyboardVisible && (
        <View style={styles.signUpButtonWrap}>
          <Button
            style={styles.signUpButton}
            title={t("signUp")}
            variant="primary"
            textColor={palette.white}
            borderRadius={24}
            onPress={handleSignup}
          />
        </View>
      )}
      <LoadingModal visible={loading} variant="modal" text={t('signingUp')} />
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scroll: {
    // flex: 1,

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
    // alignSelf: "center",
  },
  inlineError: {
    marginTop: 8,
    fontFamily: fontFamilies.urbanist,
    fontSize: 13,
    color: "#E11D48",
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
    lineHeight: 24,
    color: lightColors.smallText,
  },
  link: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    lineHeight: 24,
    color: lightColors.background,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    
  },
  signInPrompt: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 18,
    color: lightColors.smallText,
  },
  separatorWrap: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 24,
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
  socialButtonsWrap: {
    marginTop: 14,
    gap: 16,
  },
  socialButton: {
    // marginTop: 20,
    width: "100%",
    borderRadius: 1000,
  },
  signUpButtonWrap: {
    paddingHorizontal: 24,
    
    width: "100%",
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  signUpButton: {
    borderRadius: 1000,
    width: "100%",
    marginTop: 20,
    marginBottom: 30,
  },
});

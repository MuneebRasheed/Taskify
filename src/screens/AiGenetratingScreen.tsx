import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';
import Button from '../components/Button';
import LoadingModal from '../components/LoadingModal';
import Header from '../components/Header';
import Starts from '../assets/svgs/starts';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import { t, useTranslation } from '../i18n';

const AiGenetratingScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    Keyboard.dismiss();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      navigation.navigate('AiMade', { prompt: goal.trim() || undefined });
    }, 2500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
          <View style={styles.content}>
            <Header
              leftIcon={<BackArrowIcon width={28} height={28} />}
              onLeftPress={() => navigation.goBack()}
              title={t('aiMadeGoals')}
              rightIcon={<View />}
              style={styles.header}
            />

            <View style={styles.main}>
              <Starts width={80} height={80} fill={goal.trim() ? lightColors.background : lightColors.placeholderText} />
              <TextInput
                style={styles.input}
                placeholder={t('typeInYourGoalAndWeWillPrepareAPlanForYou')}
                placeholderTextColor={lightColors.subText}
                value={goal}
                onChangeText={setGoal}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            
          </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.footer}>
  <Button
    title={t("generate")}
    variant="primary"
    onPress={handleGenerate}
    textColor={lightColors.secondaryBackground}
    borderRadius={24}
    disabled={!goal.trim()}
    style={StyleSheet.flatten([
      styles.generateBtn,
      {
        backgroundColor: goal.trim()
          ? lightColors.accent   // when user types
          : lightColors.disabledButton,       // default color
      },
    ])}
  />
</View>
      </KeyboardAvoidingView>

      <LoadingModal visible={generating} variant="generating" text="Generating plan..." />
    </View>
  );
};

export default AiGenetratingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    // paddingHorizontal: 24,
  },
  header: {
    
  },
  main: {
    marginTop: 200,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  input: {
    width: '100%',
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 24,
    color: lightColors.text,
  },
  footer: {
    paddingVertical: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
      borderTopWidth: 1,
      borderColor: lightColors.border,
      backgroundColor: lightColors.BtnBackground,
  },
  generateBtn: {

    width: "100%",
    borderRadius: 1000,
    
  },
});

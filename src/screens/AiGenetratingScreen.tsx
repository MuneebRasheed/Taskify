import React, { useEffect, useState } from 'react';
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
import { Alert } from 'react-native';
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
import { useAuth } from '../lib/auth/AuthProvider';
import type { TrackerCardItem } from '../components/TrackerCard';
import { generateGoalPlan } from '../lib/api/aiGoalPlanApi';

const INVALID_GOAL_INPUT_MESSAGE =
  'Please write a proper goal you want to make and achieve. Include what you want to accomplish.';

const isMeaningfulGoalPrompt = (input: string): boolean => {
  const trimmed = input.trim();
  if (trimmed.length < 10 || trimmed.length > 300) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  if (trimmed.split(/\s+/).filter(Boolean).length < 3) return false;

  const normalized = trimmed.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const vaguePrompts = new Set([
    'goal',
    'my goal',
    'something',
    'anything',
    'help me',
    "i don't know",
    'idk',
    'test',
    'testing',
  ]);

  return !vaguePrompts.has(normalized);
};

const AiGenetratingScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { session } = useAuth();
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleGenerate = async () => {
    Keyboard.dismiss();
    const trimmed = goal.trim();
    if (!trimmed) return;
    if (!isMeaningfulGoalPrompt(trimmed)) {
      Alert.alert(t('error') ?? 'Error', INVALID_GOAL_INPUT_MESSAGE);
      return;
    }

    const accessToken = session?.access_token;
    if (!accessToken) {
      Alert.alert(
        t('error') ?? 'Error',
        t('pleaseSignInToUseAi') ??
          'Please sign in again to use AI-generated goals.'
      );
      return;
    }

    try {
      setGenerating(true);
      const { data, error } = await generateGoalPlan(
        accessToken,
        trimmed
      );

      if (error || !data) {
        const errorMessage =
          error &&
          /proper goal you want to make and achieve/i.test(error)
            ? INVALID_GOAL_INPUT_MESSAGE
            : error;
        Alert.alert(
          t('somethingWentWrong') ?? 'Something went wrong',
          errorMessage ??
            (t('failedToGeneratePlan') ??
              'Failed to generate a plan. Please try again.')
        );
        return;
      }

      const habits: TrackerCardItem[] = (data.habits ?? []).map(
        (h) => ({
          title: String(h.title ?? '').trim() || 'Habit',
          selectedDays: Array.isArray(h.selectedDays)
            ? h.selectedDays
                .map((d) => Number(d))
                .filter(
                  (d) =>
                    Number.isInteger(d) && d >= 0 && d <= 6
                )
            : [],
          reminderTime:
            h.reminderTime != null &&
            String(h.reminderTime).trim().length > 0
              ? String(h.reminderTime).trim()
              : undefined,
          variant: 'habit',
        })
      );

      const tasks: TrackerCardItem[] = (data.tasks ?? []).map(
        (tItem) => ({
          title: String(tItem.title ?? '').trim() || 'Task',
          selectedDays: [],
          dueDate:
            tItem.dueDate != null &&
            String(tItem.dueDate).trim().length > 0
              ? String(tItem.dueDate).trim()
              : undefined,
          reminderTime:
            tItem.reminderTime != null &&
            String(tItem.reminderTime).trim().length > 0
              ? String(tItem.reminderTime).trim()
              : undefined,
          variant: 'task',
        })
      );

      const displayTitle =
        (data.goalTitle && data.goalTitle.trim()) || trimmed;

      navigation.navigate('AiMade', {
        prompt: displayTitle,
        initialGoalTitle: displayTitle,
        initialHabits: habits,
        initialTasks: tasks,
        initialNote: data.note,
      });
    } catch (err) {
      console.error('[AiGenetratingScreen] generate error', err);
      Alert.alert(
        t('somethingWentWrong') ?? 'Something went wrong',
        t('failedToGeneratePlan') ??
          'Failed to generate a plan. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
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

        {!keyboardVisible && (
          <View style={styles.footer}>
            <Button
              title={t('generate')}
              variant="primary"
              onPress={handleGenerate}
              textColor={lightColors.secondaryBackground}
              borderRadius={24}
              disabled={!goal.trim()}
              style={StyleSheet.flatten([
                styles.generateBtn,
                {
                  backgroundColor: goal.trim()
                    ? lightColors.accent
                    : lightColors.disabledButton,
                },
              ])}
            />
          </View>
        )}
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

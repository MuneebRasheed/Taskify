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
import { Feather } from '@expo/vector-icons';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';
import Button from '../components/Button';
import LoadingModal from '../components/LoadingModal';
import Starts from '../assets/svgs/starts';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';

const AiGoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    Keyboard.dismiss();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 2500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: lightColors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <BackArrowIcon width={24} height={24} />
              </TouchableOpacity>
              <Text style={styles.title}>AI-made Goals</Text>
              <View style={styles.headerRight} />
            </View>

            <View style={styles.main}>
              <Starts width={80} height={80} fill={goal.trim() ? palette.orange : palette.gray400} />
              <TextInput
                style={styles.input}
                placeholder="Type in your goal and we'll prepare a plan for you..."
                placeholderTextColor={palette.gray500}
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
                title="Generate"
                variant="primary"
                onPress={handleGenerate}
                textColor={palette.white}
                borderRadius={24}
                style={styles.generateBtn}
              />
            </View>
      </KeyboardAvoidingView>

      <LoadingModal visible={generating} text="Generating plan..." />
    </View>
  );
};

export default AiGoalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  headerRight: {
    width: 32,
  },
  main: {
    // marginTop: 170,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  hint: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: palette.gray600,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  input: {
    width: '100%',
    minHeight: 120,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: lightColors.background,
    borderRadius: 16,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.text,
  },
  footer: {
    paddingVertical: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
      // width: "100%",
      borderWidth: 1,
      borderColor: lightColors.border,
  },
  generateBtn: {

    width: "100%",
    borderRadius: 1000,
    
  },
});

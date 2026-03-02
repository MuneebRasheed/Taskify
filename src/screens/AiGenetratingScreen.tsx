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
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigations/RootNavigation';
import Button from '../components/Button';
import LoadingModal from '../components/LoadingModal';
import Starts from '../assets/svgs/starts';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';

const AiGenetratingScreen = () => {
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
            <View style={styles.header}>
              <TouchableOpacity
            onPress={() => navigation.navigate('HomeScreen')}
            style={styles.backBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <BackArrowIcon width={24} height={24} />
              </TouchableOpacity>
              <Text style={styles.title}>AI-made Goals</Text>
              <View style={styles.headerRight} />
            </View>

            <View style={styles.main}>
              <Starts width={80} height={80} fill={goal.trim() ? lightColors.background : lightColors.placeholderText} />
              <TextInput
                style={styles.input}
                placeholder="Type in your goal and we'll prepare a plan for you..."
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
    title="Generate"
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

      <LoadingModal visible={generating} text="Generating plan..." />
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import TimeIcon from '../assets/svgs/TimeIcon';
import CrossIcon from '../assets/svgs/CrossIcon';
import CategoryModal, { type GoalCategory } from '../components/CategoryModal';
import CalendarModal from '../components/CalendarModal';
import TimePickerModal from '../components/TimePickerModal';
import { COVER_IMAGE_SOURCES } from './SelectCoverImageScreen';
import ImageIcon from '../assets/svgs/ImageIcon';
import Textt from '../components/Textt';
import { t, useTranslation } from '../i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';


type GoalPlannerRouteProp = RouteProp<RootStackParamList, 'GoalPlanner'>;
type GoalPlannerNavProp = NativeStackNavigationProp<RootStackParamList, 'GoalPlanner'>;


function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(hours: number, minutes: number, am: boolean): string {
  const h = am ? (hours === 12 ? 12 : hours) : hours === 12 ? 0 : hours + 12;
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

const GoalPlannerScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GoalPlannerNavProp>();
  const route = useRoute<GoalPlannerRouteProp>();

  const goalTitle = route.params?.goalTitle ?? '';
  const returnedCoverIndex = route.params?.selectedCoverIndex;
  const fromSelfMade = route.params?.fromSelfMade ?? false;

  const [goalTitleText, setGoalTitleText] = useState(goalTitle);
  const [coverIndex, setCoverIndex] = useState(0);
  const [category, setCategory] = useState<GoalCategory | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState<{ hours: number; minutes: number; am: boolean } | null>(null);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [dueDateModalVisible, setDueDateModalVisible] = useState(false);
  const [reminderDateModalVisible, setReminderDateModalVisible] = useState(false);
  const [reminderTimeModalVisible, setReminderTimeModalVisible] = useState(false);
  const goalTitleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (goalTitle) setGoalTitleText(goalTitle);
  }, [goalTitle]);

  useEffect(() => {
    if (returnedCoverIndex !== undefined) {
      setCoverIndex(returnedCoverIndex);
      navigation.setParams({ selectedCoverIndex: undefined });
    }
  }, [returnedCoverIndex, navigation]);

  const coverSource: ImageSourcePropType | null =
    COVER_IMAGE_SOURCES.length > 0 && coverIndex < COVER_IMAGE_SOURCES.length
      ? COVER_IMAGE_SOURCES[coverIndex]
      : null;

  const openSelectCover = () => {
    navigation.navigate('SelectCoverImage', { selectedIndex: coverIndex });
  };

  const handleCategoryConfirm = () => {
    setCategoryModalVisible(false);
  };

  const handleDueDateConfirm = () => {  
    setDueDateModalVisible(false);
  };

  const handleReminderDateConfirm = () => {
    setReminderDateModalVisible(false);
    setReminderTimeModalVisible(true);
  };

  const handleReminderTimeConfirm = (hours: number, minutes: number, am: boolean) => {
    setReminderTime({ hours, minutes, am });
    setReminderTimeModalVisible(false);
  };

  const reminderDisplay =
    reminderDate && reminderTime
      ? `${formatDate(reminderDate)} - ${formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)}`
      : '';

  const handleSaveGoal = () => {
    // TODO: persist goal and navigate
    navigation.goBack();
    
  };
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: lightColors.secondaryBackground },
      ]}
    >

<TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('AiMade', fromSelfMade ? { source: 'selfMade', prompt: goalTitleText } : { prompt: goalTitleText })}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.backBtnCircle}>
              <BackArrowIcon width={24} height={24} />
            </View>
          </TouchableOpacity>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Part 1: Cover image + back arrow + change cover icon */}
        <View style={styles.coverWrap}>
          {coverSource ? (
            <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>Cover image</Text>
              <Text style={styles.coverPlaceholderHint}>Tap camera to select</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.changeCoverBtn}
            onPress={openSelectCover}
            activeOpacity={0.8}
          >
            <ImageIcon width={43} height={43} />
          </TouchableOpacity>
        </View>

        {/* Part 2: Goals Title (with edit icon when from self-made flow) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Textt i18nKey="goalsTitle" style={styles.label} />
            {fromSelfMade && (
              <TouchableOpacity
                onPress={() => goalTitleInputRef.current?.focus()}
                style={styles.editTitleBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil" size={20} color={lightColors.text} />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            ref={goalTitleInputRef}
            style={styles.input}
            value={goalTitleText}
            onChangeText={setGoalTitleText}
            placeholder={t("goalsTitle")}
            placeholderTextColor={lightColors.subText}
            editable
          />
        </View>

        {/* Part 3: Category */}
        <View style={styles.section}>
          <Textt i18nKey="category" style={styles.label} />
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.inputRowText, !category && styles.placeholder]}
              numberOfLines={1}
            >
              {category ?? t("category")}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>
        </View>

        {/* Part 4: Goals Due Date */}
        <View style={styles.section}>
          <Textt i18nKey="goalsDueDate" style={styles.label} />
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setDueDateModalVisible(true)}
            activeOpacity={0.7}
          >
            <CalendarIcon width={20} height={20} />
            <Text
              style={[styles.inputRowTextFlex, !dueDate && styles.placeholder]}
              numberOfLines={1}
            >
              {dueDate ? formatDate(dueDate) : t("goalsDueDate")}
            </Text>
            {dueDate && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setDueDate(null);
                }}
                style={styles.clearBtn}
              >
                <CrossIcon />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Part 5: Goals Reminder */}
        <View style={styles.section}>
          <Textt i18nKey="goalsReminder" style={styles.label} />
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setReminderDateModalVisible(true)}
            activeOpacity={0.7}
          >
            <TimeIcon width={20} height={20} />
            <Text
              style={[styles.inputRowTextFlex, !reminderDisplay && styles.placeholder]}
              numberOfLines={1}
            >
              {reminderDisplay || t("goalsReminder")}
            </Text>
            {reminderDisplay && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setReminderDate(null);
                  setReminderTime(null);
                }}
                style={styles.clearBtn}
              >
                <CrossIcon />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Part 6: Save Goals button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          title={t("saveGoals")}
          variant="primary"
          onPress={handleSaveGoal}
          style={styles.saveBtn}
        />
      </View>

      <CategoryModal
        visible={categoryModalVisible}
        selectedCategory={category}
        onSelect={setCategory}
        onCancel={() => setCategoryModalVisible(false)}
        onConfirm={handleCategoryConfirm}
      />

      <CalendarModal
        visible={dueDateModalVisible}
        title={t("goalsDueDate")}
        selectedDate={dueDate}
        onSelect={setDueDate}
        onCancel={() => setDueDateModalVisible(false)}
        onConfirm={handleDueDateConfirm}
      />

      <CalendarModal
        visible={reminderDateModalVisible}
        title={t("goalsReminder")}
        selectedDate={reminderDate}
        onSelect={setReminderDate}
        onCancel={() => setReminderDateModalVisible(false)}
        onConfirm={handleReminderDateConfirm}
      />

      <TimePickerModal
        visible={reminderTimeModalVisible}
        title={t("goalsReminder")}
        initialTime={
          reminderTime
            ? { hours: reminderTime.hours, minutes: reminderTime.minutes, am: reminderTime.am }
            : { hours: 10, minutes: 0, am: true }
        }
        onCancel={() => setReminderTimeModalVisible(false)}
        onConfirm={handleReminderTimeConfirm}
      />
    </View>
  );
};

export default GoalPlannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  coverWrap: {
    height: 430,
    backgroundColor: lightColors.inputBackground,
    position: 'relative',
  },
  coverImage: {

    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.inputBackground,
  },
  coverPlaceholderText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.subText,
  },
  coverPlaceholderHint: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
    marginTop: 4,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 24,
    zIndex: 2,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  changeCoverBtn: {
    
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  label: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 8,
    marginTop: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  editTitleBtn: {
    padding: 4,
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  inputRowText: {
    flex: 1,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
  },
  inputRowTextFlex: {
    flex: 1,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
  },
  placeholder: {
    color: lightColors.placeholderText,
  },
  chevron: {
    fontSize: 18,
    color: lightColors.text,
  },
  clearBtn: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: lightColors.secondaryBackground,
    borderTopWidth: 1,
      borderTopColor: lightColors.border,
    },
  saveBtn: {
    width: '100%',
    borderRadius: 1000,
  },
});

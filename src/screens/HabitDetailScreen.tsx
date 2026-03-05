import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import TimeIcon from '../assets/svgs/TimeIcon';
import { TRACKER_DAYS } from '../components/TrackerCard';
import Header from '../components/Header';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import CrossIcon from '../assets/svgs/CrossIcon';
import TimePickerModal from '../components/TimePickerModal';
import { useGoals } from '../context/GoalsContext';
import { t } from '../i18n';
import DeleteIcon from '../assets/svgs/DeleteIcon';
import ConfirmModal from '../components/ConfirmModal';

type HabitDetailRouteProp = RouteProp<RootStackParamList, 'HabitDetailScreen'>;
type HabitDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'HabitDetailScreen'>;

const formatTime = (hours: number, minutes: number, am: boolean): string => {
  const labelHours = hours.toString().padStart(2, '0');
  const labelMinutes = minutes.toString().padStart(2, '0');
  return `${labelHours}:${labelMinutes} ${am ? 'AM' : 'PM'}`;
};

const HabitDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HabitDetailNavProp>();
  const route = useRoute<HabitDetailRouteProp>();
  const { goalId, itemId } = route.params;
  const { goals, toggleItemCompletion, removeGoalItem, updateGoalItem } = useGoals();

  const goal = goals.find((g) => g.id === goalId);
  const item = goal?.items?.find((i) => i.id === itemId && i.type === 'habit');

  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('');
  const [note, setNote] = useState('');
  const [paused, setPaused] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setSelectedDays(item.selectedDays ?? [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(item.reminderTime ?? '');
      setNote(item.note ?? '');
      setPaused(item.paused ?? false);
    }
  }, [item]);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const clearReminder = () => setReminderTime('');

  const handleFormHabit = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    toggleItemCompletion(itemId, todayStr, goalId);
    navigation.goBack();
  };

  const handleSave = () => {
    updateGoalItem(goalId, itemId, {
      title: title.trim() || item?.title,
      reminderTime: reminderTime.trim() || undefined,
      note: note.trim() || undefined,
      selectedDays,
      paused,
    });
    navigation.goBack();
  };

  const handleDeletePress = () => setDeleteModalVisible(true);

  const handleDeleteConfirm = () => {
    removeGoalItem(goalId, itemId);
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  if (!goal || !item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: lightColors.secondaryBackground },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <Header
          leftIcon={<BackArrowIcon width={28} height={28} />}
          onLeftPress={() => navigation.goBack()}
          title={<Text style={styles.headerTitle}>Habit</Text>}
          rightIcon={
            <TouchableOpacity onPress={handleDeletePress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <DeleteIcon width={28} height={28} color={lightColors.accent} />
            </TouchableOpacity>
          }
          style={styles.header}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Habit Title</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlex}
                value={title}
                onChangeText={setTitle}
                placeholder="Make UI/UX design portfolio"
                placeholderTextColor={lightColors.placeholderText}
              />
            </View>

            <Text style={styles.label}>Repeat Days</Text>
            <View style={styles.daysRow}>
              {TRACKER_DAYS.map((day, index) => {
                const isSelected = selectedDays.includes(index);
                return (
                  <TouchableOpacity
                    key={`${day}-${index}`}
                    onPress={() => toggleDay(index)}
                    style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Habit Reminder</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setReminderModalVisible(true)}
            >
              <View style={styles.inputRow}>
                <TimeIcon width={20} height={20} />
                <Text style={styles.inputFlex} numberOfLines={1}>
                  {reminderTime || '09:00 AM'}
                </Text>
                {reminderTime.length > 0 && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      clearReminder();
                    }}
                    style={styles.clearBtn}
                  >
                    <CrossIcon width={20} height={20} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Create portfolio for Dribbble & Behance"
              placeholderTextColor={lightColors.placeholderText}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.pauseRow}>
              <View style={styles.pauseLabelWrap}>
                <Text style={styles.label}>Pause Habit</Text>
                <Text style={styles.pauseDesc}>
                  Short breaks habit, start when you're ready
                </Text>
              </View>
              <Switch
                value={paused}
                onValueChange={setPaused}
                trackColor={{ false: lightColors.border, true: `${lightColors.accent}80` }}
                thumbColor={lightColors.secondaryBackground}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            style={styles.formHabitBtn}
            onPress={handleFormHabit}
            activeOpacity={0.8}
          >
            <Text style={styles.formHabitBtnText}>Form Habit</Text>
          </TouchableOpacity>
          <Button
            title="Save"
            variant="primary"
            onPress={handleSave}
            style={styles.saveBtn}
            backgroundColor={lightColors.accent}
            textColor={lightColors.secondaryBackground}
          />
        </View>
      </KeyboardAvoidingView>

      <TimePickerModal
        visible={reminderModalVisible}
        title="Habit Reminder"
        onCancel={() => setReminderModalVisible(false)}
        onConfirm={(h, m, isAm) => {
          setReminderTime(formatTime(h, m, isAm));
          setReminderModalVisible(false);
        }}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title={t('deleteHabit') as string}
        message={t('deleteHabitConfirm') as string}
        cancelLabel={t('cancel') as string}
        confirmLabel={t('yesDelete') as string}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

export default HabitDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  label: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    gap: 10,
  },
  inputFlex: {
    flex: 1,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.secondaryBackground,
    borderWidth: 1,
    borderColor: lightColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: lightColors.accent,
    borderColor: lightColors.accent,
  },
  dayText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.subText,
  },
  dayTextSelected: {
    color: lightColors.secondaryBackground,
    fontFamily: fontFamilies.urbanistSemiBold,
  },
  noteInput: {
    minHeight: 80,
  },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pauseLabelWrap: {
    flex: 1,
  },
  pauseDesc: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.subText,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    backgroundColor: lightColors.secondaryBackground,
    gap: 12,
  },
  formHabitBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10000,
    borderWidth: 2,
    borderColor: lightColors.accent,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHabitBtnText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
  },
  saveBtn: {
    width: '100%',
    borderRadius: 1000,
  },
  errorText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
    textAlign: 'center',
    marginTop: 48,
  },
  backLink: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
    textAlign: 'center',
    marginTop: 16,
  },
});

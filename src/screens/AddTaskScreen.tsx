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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import TimeIcon from '../assets/svgs/TimeIcon';
import { TRACKER_DAYS } from '../components/TrackerCard';
import type { TrackerCardItem } from '../components/TrackerCard';
import Textt from '../components/Textt';
import Header from '../components/Header';
import CrossIcon from '../assets/svgs/CrossIcon';
import InfoIcon from '../assets/svgs/InfoIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import CalendarModal from '../components/CalendarModal';
import TimePickerModal from '../components/TimePickerModal';
import InfoModal from '../components/InfoModal';
import { useGoalStore } from '../../store/goalStore';
import { useGoals } from '../context/GoalsContext';
import { useTranslation } from '../i18n';

type AddTaskRouteProp = RouteProp<RootStackParamList, 'AddTaskScreen'>;
type AddTaskNavProp = NativeStackNavigationProp<RootStackParamList, 'AddTaskScreen'>;

const AddTaskScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AddTaskNavProp>();
  const route = useRoute<AddTaskRouteProp>();
  const { mode, prompt, source, editHabitIndex, editTaskIndex, initialItem, goalId, itemId } = route.params;
  const { updateGoalItem } = useGoals();
  const { t } = useTranslation();

  const isHabit = mode === 'habit';
  const isEdit =
    (isHabit && editHabitIndex !== undefined) || (!isHabit && editTaskIndex !== undefined);
  const isGoalItemEdit =
    typeof goalId === 'string' &&
    goalId.length > 0 &&
    typeof itemId === 'string' &&
    itemId.length > 0;

  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueDateDate, setDueDateDate] = useState<Date | null>(null);
  const [note, setNote] = useState('');

  const [dueDateModalVisible, setDueDateModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string; repeatDays?: string }>({});

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (hours: number, minutes: number, am: boolean): string => {
    const labelHours = hours.toString().padStart(2, '0');
    const labelMinutes = minutes.toString().padStart(2, '0');
    return `${labelHours}:${labelMinutes} ${am ? 'AM' : 'PM'}`;
  };

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setSelectedDays(initialItem.selectedDays?.length ? initialItem.selectedDays : []);
      setReminderTime(initialItem.reminderTime ?? '');
      if (initialItem.dueDate) {
        setDueDate(initialItem.dueDate);
      } else {
        setDueDate('');
      }
      setNote('');
    } else {
      setTitle(isHabit ? '' : '');
      setSelectedDays(isHabit ? [] : []);
      setReminderTime('');
      setDueDate('');
      setDueDateDate(null);
      setNote('');
    }
  }, [initialItem, isHabit]);

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

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const next = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
      if (errors.repeatDays && next.length > 0) {
        setErrors((p) => ({ ...p, repeatDays: undefined }));
      }
      return next;
    });
  };

  const clearReminder = () => setReminderTime('');
  const clearDueDate = () => {
    setDueDate('');
    setDueDateDate(null);
  };

  const buildItem = (): TrackerCardItem => {
    const base = {
      title: title.trim() || (isHabit ? 'New Habit' : 'New Task'),
      selectedDays: isHabit ? selectedDays : [],
      reminderTime: reminderTime.trim() || undefined,
      variant: mode as 'habit' | 'task',
    };
    if (isHabit) return base;
    return { ...base, dueDate: dueDate.trim() || undefined };
  };

  const addDraftHabit = useGoalStore((s) => s.addDraftHabit);
  const addDraftTask = useGoalStore((s) => s.addDraftTask);
  const updateDraftHabit = useGoalStore((s) => s.updateDraftHabit);
  const updateDraftTask = useGoalStore((s) => s.updateDraftTask);

  const aiMadeParams = (extra: object) =>
    source === 'selfMade' ? { source: 'selfMade' as const, prompt: prompt ?? '', ...extra } : { prompt: prompt ?? '', ...extra };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const nextErrors: { title?: string; dueDate?: string; repeatDays?: string } = {};
    if (!title.trim()) nextErrors.title = 'This is mandatory';
    if (isHabit && selectedDays.length === 0) nextErrors.repeatDays = 'This is mandatory';
    if (!isHabit && !dueDate.trim()) nextErrors.dueDate = 'This is mandatory';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const item = buildItem();
    if (isGoalItemEdit) {
      updateGoalItem(goalId, itemId, {
        title: item.title,
        reminderTime: item.reminderTime,
        selectedDays: isHabit ? item.selectedDays : undefined,
        dueDate: !isHabit ? item.dueDate : undefined,
      });
      navigation.goBack();
      return;
    }
    if (source === 'selfMade') {
      if (isEdit) {
        if (isHabit && editHabitIndex !== undefined) {
          updateDraftHabit(editHabitIndex, item);
        } else if (!isHabit && editTaskIndex !== undefined) {
          updateDraftTask(editTaskIndex, item);
        }
      } else {
        if (isHabit) addDraftHabit(item);
        else addDraftTask(item);
      }
      navigation.goBack();
      return;
    }
    if (isEdit) {
      if (isHabit && editHabitIndex !== undefined) {
        navigation.navigate('AiMade', aiMadeParams({ updatedHabit: { index: editHabitIndex, item } }));
      } else if (!isHabit && editTaskIndex !== undefined) {
        navigation.navigate('AiMade', aiMadeParams({ updatedTask: { index: editTaskIndex, item } }));
      }
    } else {
      if (isHabit) {
        navigation.navigate('AiMade', aiMadeParams({ addedHabit: item }));
      } else {
        navigation.navigate('AiMade', aiMadeParams({ addedTask: item }));
      }
    }
  };

  const screenTitle = isEdit
    ? isHabit
      ? 'Edit Habit'
      : 'Edit Task'
    : isHabit
      ? 'Add Habit'
      : 'Add Task';
  const submitLabel = isEdit
    ? isHabit
      ? 'Update Habit'
      : 'Update Task'
    : isHabit
      ? 'Add Habit'
      : 'Add Task';

  const infoTips = isHabit
    ? [
        { i18nKey: 'habitInfoTip1' },
        { i18nKey: 'habitInfoTip2' },
        { i18nKey: 'habitInfoTip3' },
        { i18nKey: 'habitInfoTip4' },
      ]
    : [
        { i18nKey: 'taskInfoTip1' },
        { i18nKey: 'taskInfoTip2' },
        { i18nKey: 'taskInfoTip3' },
        { i18nKey: 'taskInfoTip4' },
      ];

  const infoTitle = isHabit ? t('habitInfoTitle') : t('taskInfoTitle');

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
          leftIcon={<CrossIcon width={28} height={28} />}
          onLeftPress={() => navigation.goBack()}
          title={
            <Textt
              i18nKey={
                isEdit
                  ? isHabit
                    ? 'editHabit'
                    : 'editTask'
                  : isHabit
                    ? 'addHabit'
                    : 'addTask'
              }
              style={styles.headerTitle}
            />
          }
          rightIcon={<View />}
          style={styles.header}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.labelRow}>
              <Textt i18nKey={isHabit ? 'habit' : 'task'} style={styles.label} />
              <TouchableOpacity
                onPress={() => setInfoModalVisible(true)}
                style={styles.infoButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <InfoIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              {/* <TimeIcon width={20} height={20} /> */}
              <TextInput
                style={styles.inputFlex}
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  if (errors.title && v.trim()) setErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder={isHabit ? 'Habit title...' : 'Task title...'}
                placeholderTextColor={lightColors.placeholderText}
              />
              {title.length > 0 && (
                <TouchableOpacity
                  onPress={() => setTitle('')}
                  style={styles.clearBtn}
                >
                  <CrossIcon width={20} height={20} />
                </TouchableOpacity>
              )}
            </View>
            {!!errors.title && <Text style={styles.inlineError}>{errors.title}</Text>}

            {isHabit && (
              <>
                <Textt i18nKey="repeatDays" style={styles.label} />
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
                {!!errors.repeatDays && (
                  <Text style={styles.inlineError}>{errors.repeatDays}</Text>
                )}
              </>
            )}

            {!isHabit && (
              <>
                <Textt i18nKey="goalsDueDate" style={styles.label} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDueDateModalVisible(true)}
                >
                  <View style={[styles.inputRow, !!errors.dueDate && styles.inputRowError]}>
                    <CalendarIcon width={20} height={20} />
                    <Text
                      style={styles.inputFlex}
                      numberOfLines={1}
                    >
                      {dueDate || 'Select date'}
                    </Text>
                    {dueDate.length > 0 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          clearDueDate();
                        }}
                        style={styles.clearBtn}
                      >
                        <CrossIcon width={20} height={20} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                {!!errors.dueDate && <Text style={styles.inlineError}>{errors.dueDate}</Text>}
              </>
            )}

            <Text style={styles.label}>
              {isHabit ? 'Reminder' : 'Reminder'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setReminderModalVisible(true)}
            >
              <View style={styles.inputRow}>
                <TimeIcon width={20} height={20} />
                <Text
                  style={styles.inputFlex}
                  numberOfLines={1}
                >
                  {reminderTime || 'Set time'}
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

            <Textt i18nKey="note" style={styles.label} />
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add details or instructions..."
              placeholderTextColor={lightColors.placeholderText}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </TouchableWithoutFeedback>

        {!keyboardVisible && (
          <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
            <Button
              title={submitLabel}
              variant="primary"
              onPress={handleSubmit}
              style={styles.submitBtn}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Task Due Date calendar */}
      {!isHabit && (
        <CalendarModal
          visible={dueDateModalVisible}
          title="Task Due Date"
          selectedDate={dueDateDate}
          onSelect={(date) => {
            setDueDateDate(date);
            setDueDate(formatDate(date));
          }}
          onCancel={() => setDueDateModalVisible(false)}
          onConfirm={() => setDueDateModalVisible(false)}
        />
      )}

      {/* Habit / Task reminder time picker */}
      <TimePickerModal
        visible={reminderModalVisible}
        title={isHabit ? 'habitReminder' : 'taskReminder'}
        onCancel={() => setReminderModalVisible(false)}
        onConfirm={(h, m, isAm) => {
          setReminderTime(formatTime(h, m, isAm));
          setReminderModalVisible(false);
        }}
      />

      {/* Info Modal */}
      <InfoModal
        visible={infoModalVisible}
        title={infoTitle}
        tips={infoTips}
        onClose={() => setInfoModalVisible(false)}
      />
    </View>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  closeText: {
    // fontSize: 20,
    // color: lightColors.text,
    // fontWeight: '600',
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 20,
    gap: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.04,
    // shadowRadius: 2,
    // elevation: 2,
  },
  inputRowError: {
    borderColor: '#E11D48',
  },
  inlineError: {
    marginTop: -12,
    marginBottom: 16,
    fontFamily: fontFamilies.urbanist,
    fontSize: 13,
    color: '#E11D48',
  },
  // inputIcon: {
  //   fontSize: 16,
  // },
  inputFlex: {
    // backgroundColor: lightColors.inputBackground,

    flex: 1,
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 18,
    color: lightColors.placeholderText,

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
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',

  },
  dayCircleSelected: {
    backgroundColor: lightColors.background,
    borderColor: lightColors.background,
  },
  dayText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 20,
    color: lightColors.subText,
  },
  dayTextSelected: {
    color: lightColors.secondaryBackground,
  },
  noteInput: {
    minHeight: 80,
    paddingTop: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: lightColors.border,
  },
  submitBtn: {
    width: '100%',
    borderRadius: 1000,
  },
});

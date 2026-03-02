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
import CrossIcon from '../assets/svgs/CrossIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import CalendarModal from '../components/CalendarModal';
import TimePickerModal from '../components/TimePickerModal';
type AddTaskRouteProp = RouteProp<RootStackParamList, 'AddTaskScreen'>;
type AddTaskNavProp = NativeStackNavigationProp<RootStackParamList, 'AddTaskScreen'>;

const AddTaskScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AddTaskNavProp>();
  const route = useRoute<AddTaskRouteProp>();
  const { mode, prompt, source, editHabitIndex, editTaskIndex, initialItem } = route.params;

  const isHabit = mode === 'habit';
  const isEdit =
    (isHabit && editHabitIndex !== undefined) || (!isHabit && editTaskIndex !== undefined);

  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueDateDate, setDueDateDate] = useState<Date | null>(null);
  const [note, setNote] = useState('');

  const [dueDateModalVisible, setDueDateModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

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

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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

  const aiMadeParams = (extra: object) =>
    source === 'selfMade' ? { source: 'selfMade' as const, prompt: prompt ?? '', ...extra } : { prompt: prompt ?? '', ...extra };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const item = buildItem();
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <CrossIcon width={28} height={28} />
          </TouchableOpacity>
          <Textt i18nKey={isEdit ? (isHabit ? 'editHabit' : 'editTask') : (isHabit ? 'addHabit' : 'addTask')} style={styles.headerTitle} />
          <View style={styles.headerRight} />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Textt i18nKey={isHabit ? 'habit' : 'task'} style={styles.label} />
            <View style={styles.inputRow}>
              {/* <TimeIcon width={20} height={20} /> */}
              <TextInput
                style={styles.inputFlex}
                value={title}
                onChangeText={setTitle}
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

            {isHabit && (
              <>
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
              </>
            )}

            {!isHabit && (
              <>
                <Text style={styles.label}>Task Due Date</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDueDateModalVisible(true)}
                >
                  <View style={styles.inputRow}>
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
              </>
            )}

            <Text style={styles.label}>
              {isHabit ? 'Habit Reminder' : 'Task Reminder'}
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

            <Text style={styles.label}>Note</Text>
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

        <View style={[styles.footer, { paddingBottom: insets.bottom}]}>
          <Button
            title={submitLabel}
            variant="primary"
            onPress={handleSubmit}
            style={styles.submitBtn}
            backgroundColor={lightColors.accent}
            textColor={lightColors.secondaryBackground}
          />
        </View>
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
        title={isHabit ? 'Habit Reminder' : 'Task Reminder'}
        onCancel={() => setReminderModalVisible(false)}
        onConfirm={(h, m, isAm) => {
          setReminderTime(formatTime(h, m, isAm));
          setReminderModalVisible(false);
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: lightColors.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
  },
  headerRight: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
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
    fontSize: 16,
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
    borderColor: lightColors.placeholderText,
    alignItems: 'center',
    justifyContent: 'center',

  },
  dayCircleSelected: {
    backgroundColor: lightColors.background,
    borderColor: lightColors.background,
  },
  dayText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 14,
    color: lightColors.placeholderText,
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
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: lightColors.border,
  },
  submitBtn: {
    width: '100%',
    borderRadius: 1000,
  },
});

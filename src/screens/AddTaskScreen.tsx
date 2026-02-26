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
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import TimeIcon from '../assets/svgs/TimeIcon';
import { TRACKER_DAYS } from '../components/TrackerCard';
import type { TrackerCardItem } from '../components/TrackerCard';
import Textt from '../components/Textt';
import CrossIcon from '../assets/svgs/CrossIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
type AddTaskRouteProp = RouteProp<RootStackParamList, 'AddTaskScreen'>;
type AddTaskNavProp = NativeStackNavigationProp<RootStackParamList, 'AddTaskScreen'>;

const AddTaskScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AddTaskNavProp>();
  const route = useRoute<AddTaskRouteProp>();
  const { mode, prompt, editHabitIndex, editTaskIndex, initialItem } = route.params;

  const isHabit = mode === 'habit';
  const isEdit =
    (isHabit && editHabitIndex !== undefined) || (!isHabit && editTaskIndex !== undefined);

  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 2, 4]);
  const [reminderTime, setReminderTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setSelectedDays(initialItem.selectedDays?.length ? initialItem.selectedDays : [0, 2, 4]);
      setReminderTime(initialItem.reminderTime ?? '');
      setDueDate(initialItem.dueDate ?? '');
      setNote('');
    } else {
      setTitle(isHabit ? '' : '');
      setSelectedDays([0, 2, 4]);
      setReminderTime('');
      setDueDate('');
      setNote('');
    }
  }, [initialItem, isHabit]);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const clearReminder = () => setReminderTime('');
  const clearDueDate = () => setDueDate('');

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

  const handleSubmit = () => {
    Keyboard.dismiss();
    const item = buildItem();
    if (isEdit) {
      if (isHabit && editHabitIndex !== undefined) {
        navigation.navigate('AiMade', {
          prompt,
          updatedHabit: { index: editHabitIndex, item },
        });
      } else if (!isHabit && editTaskIndex !== undefined) {
        navigation.navigate('AiMade', {
          prompt,
          updatedTask: { index: editTaskIndex, item },
        });
      }
    } else {
      if (isHabit) {
        navigation.navigate('AiMade', { prompt, addedHabit: item });
      } else {
        navigation.navigate('AiMade', { prompt, addedTask: item });
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
        { paddingTop: insets.top, backgroundColor: lightColors.background },
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
                placeholderTextColor={palette.gray900}
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
                <View style={styles.inputRow}>
                  <CalendarIcon width={20} height={20} />
                  <TextInput
                    style={styles.inputFlex}
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="Select date"
                    placeholderTextColor={palette.gray500}
                  />
                  {dueDate.length > 0 && (
                    <TouchableOpacity onPress={clearDueDate} style={styles.clearBtn}>
                      <CrossIcon width={20} height={20} />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            <Text style={styles.label}>
              {isHabit ? 'Habit Reminder' : 'Task Reminder'}
            </Text>
            <View style={styles.inputRow}>
              <TimeIcon width={20} height={20} />
              <TextInput
                style={styles.inputFlex}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="Set time"
                placeholderTextColor={palette.gray500}
              />
              {reminderTime.length > 0 && (
                <TouchableOpacity onPress={clearReminder} style={styles.clearBtn}>
                  <CrossIcon width={20} height={20} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Note</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Add details or instructions..."
              placeholderTextColor={palette.gray500}
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
            backgroundColor={palette.orange}
            textColor={palette.white}
          />
        </View>
      </KeyboardAvoidingView>
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
    color: palette.black,
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: palette.blackText,
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
    color: palette.blackText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 18,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: palette.blackText,
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
    color: palette.blackText,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 16,
    color: palette.gray600,

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
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray300,
    alignItems: 'center',
    justifyContent: 'center',

  },
  dayCircleSelected: {
    backgroundColor: palette.orange,
    borderColor: palette.orange,
  },
  dayText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 14,
    color: palette.gray800,
  },
  dayTextSelected: {
    color: palette.white,
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

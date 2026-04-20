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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/RootNavigation';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from '../components/Button';
import TimeIcon from '../assets/svgs/TimeIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import Header from '../components/Header';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import CrossIcon from '../assets/svgs/CrossIcon';
import CalendarModal from '../components/CalendarModal';
import TimePickerModal from '../components/TimePickerModal';
import { useGoals } from '../context/GoalsContext';
import { t } from '../i18n';
import DeleteIcon from '../assets/svgs/DeleteIcon';
import ConfirmModal from '../components/ConfirmModal';

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetailScreen'>;
type TaskDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetailScreen'>;

const formatDate = (d: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dNorm = new Date(d);
  dNorm.setHours(0, 0, 0, 0);
  const isToday = dNorm.getTime() === today.getTime();
  if (isToday) {
    return `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (hours: number, minutes: number, am: boolean): string => {
  const labelHours = hours.toString().padStart(2, '0');
  const labelMinutes = minutes.toString().padStart(2, '0');
  return `${labelHours}:${labelMinutes} ${am ? 'AM' : 'PM'}`;
};

function parseYmdFromDueRaw(raw: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

const TaskDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TaskDetailNavProp>();
  const route = useRoute<TaskDetailRouteProp>();
  const { goalId, itemId } = route.params;
  const { goals, toggleItemCompletion, removeGoalItem, updateGoalItem } = useGoals();

  const goal = goals.find((g) => g.id === goalId);
  const item = goal?.items?.find((i) => i.id === itemId && i.type === 'task');

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueDateDate, setDueDateDate] = useState<Date | null>(null);
  const [reminderTime, setReminderTime] = useState('');
  const [note, setNote] = useState('');
  const [dueDateModalVisible, setDueDateModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (item && goal) {
      setTitle(item.title);
      let initialDue = '';
      let initialDueAsDate: Date | null = null;
      if (item.dueDate && typeof item.dueDate === 'string' && item.dueDate.trim() !== '') {
        const ymd = parseYmdFromDueRaw(item.dueDate);
        if (ymd) {
          initialDueAsDate = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d, 12, 0, 0));
          initialDue = formatDate(initialDueAsDate);
        } else {
          initialDue = item.dueDate.trim();
        }
      } else if (goal.dueDate) {
        initialDueAsDate = goal.dueDate;
        initialDue = formatDate(goal.dueDate);
      }
      setDueDate(initialDue);
      setReminderTime(item.reminderTime ?? '');
      setNote(item.note ?? '');
      setDueDateDate(initialDueAsDate);
    }
  }, [item, goal]);

  const clearDueDate = () => {
    setDueDate('');
    setDueDateDate(null);
  };

  const clearReminder = () => setReminderTime('');

  const handleFinishTask = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    toggleItemCompletion(itemId, todayStr, goalId);
    navigation.goBack();
  };

  const handleSave = () => {
    updateGoalItem(goalId, itemId, {
      title: title.trim() || item?.title,
      reminderTime: reminderTime.trim() || undefined,
      note: note.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
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
        <Text style={styles.errorText}>Task not found</Text>
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
          title={<Text style={styles.headerTitle}>Task</Text>}
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
            <Text style={styles.label}>Task Title</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlex}
                value={title}
                onChangeText={setTitle}
                placeholder="Find a UI/UX design online course"
                placeholderTextColor={lightColors.placeholderText}
              />
            </View>

            <Text style={styles.label}>Task Due Date</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDueDateModalVisible(true)}
            >
              <View style={styles.inputRow}>
                <CalendarIcon width={20} height={20} />
                <Text style={styles.inputFlex} numberOfLines={1}>
                  {dueDate || 'Today, Dec 22, 2024'}
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

            <Text style={styles.label}>Task Reminder</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setReminderModalVisible(true)}
            >
              <View style={styles.inputRow}>
                <TimeIcon width={20} height={20} />
                <Text style={styles.inputFlex} numberOfLines={1}>
                  {reminderTime || '16:00 PM'}
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
              placeholder="Find online course on Coursera & Udemy"
              placeholderTextColor={lightColors.placeholderText}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
          <TouchableOpacity
            style={styles.finishTaskBtn}
            onPress={handleFinishTask}
            activeOpacity={0.8}
          >
            <Text style={styles.finishTaskBtnText}>Finish Task</Text>
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

      <TimePickerModal
        visible={reminderModalVisible}
        title="Task Reminder"
        onCancel={() => setReminderModalVisible(false)}
        onConfirm={(h, m, isAm) => {
          setReminderTime(formatTime(h, m, isAm));
          setReminderModalVisible(false);
        }}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title={t('deleteTask') as string}
        message={t('deleteTaskConfirm') as string}
        cancelLabel={t('cancel') as string}
        confirmLabel={t('yesDelete') as string}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

export default TaskDetailScreen;

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
  noteInput: {
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    backgroundColor: lightColors.secondaryBackground,
    gap: 12,
  },
  finishTaskBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10000,
    borderWidth: 2,
    borderColor: lightColors.accent,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishTaskBtnText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.accent,
  },
  saveBtn: {
    width: '100%',
    borderRadius: 10000,
  },
  errorText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
    textAlign: 'center',
    marginTop: 48,
  },
  backLink: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.accent,
    textAlign: 'center',
    marginTop: 16,
  },
});

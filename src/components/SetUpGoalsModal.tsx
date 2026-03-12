import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import { type GoalCategory, CategoryPickerContent } from './CategoryModal';
import { CalendarContent } from './CalendarModal';
import { TimePickerContent } from './TimePickerModal';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import TimeIcon from '../assets/svgs/TimeIcon';
import CrossIcon from '../assets/svgs/CrossIcon';
import BottomArrowIcon from '../assets/svgs/BotttomArrowIcon';

type ModalView = 'main' | 'category' | 'dueDate' | 'reminderDate' | 'reminderTime';

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

export interface SetUpGoalsModalProps {
  visible: boolean;
  goalTitle: string;
  category: GoalCategory | null;
  dueDate: Date | null;
  reminderDate: Date | null;
  reminderTime: { hours: number; minutes: number; am: boolean } | null;
  onCancel: () => void;
  onConfirm: (data: {
    goalTitle: string;
    category: GoalCategory | null;
    dueDate: Date | null;
    reminderDate: Date | null;
    reminderTime: { hours: number; minutes: number; am: boolean } | null;
  }) => void;
  t: (key: string) => string;
}

const SetUpGoalsModal: React.FC<SetUpGoalsModalProps> = ({
  visible,
  goalTitle: initialGoalTitle,
  category: initialCategory,
  dueDate: initialDueDate,
  reminderDate: initialReminderDate,
  reminderTime: initialReminderTime,
  onCancel,
  onConfirm,
  t,
}) => {
  const insets = useSafeAreaInsets();
  const [goalTitle, setGoalTitle] = useState(initialGoalTitle);
  const [category, setCategory] = useState<GoalCategory | null>(initialCategory);
  const [dueDate, setDueDate] = useState<Date | null>(initialDueDate);
  const [reminderDate, setReminderDate] = useState<Date | null>(initialReminderDate);
  const [reminderTime, setReminderTime] = useState<{
    hours: number;
    minutes: number;
    am: boolean;
  } | null>(initialReminderTime);

  const [currentView, setCurrentView] = useState<ModalView>('main');

  useEffect(() => {
    if (visible) {
      setGoalTitle(initialGoalTitle);
      setCategory(initialCategory);
      setDueDate(initialDueDate);
      setReminderDate(initialReminderDate);
      setReminderTime(initialReminderTime);
      setCurrentView('main');
    }
  }, [
    visible,
    initialGoalTitle,
    initialCategory,
    initialDueDate,
    initialReminderDate,
    initialReminderTime,
  ]);

  const reminderDisplay =
    reminderDate && reminderTime
      ? `${formatDate(reminderDate)} - ${formatTime(reminderTime.hours, reminderTime.minutes, reminderTime.am)}`
      : '';

  const handleOK = () => {
    onConfirm({
      goalTitle,
      category,
      dueDate,
      reminderDate,
      reminderTime,
    });
  };

  const goBack = () => setCurrentView('main');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (currentView !== 'main') {
          setCurrentView('main');
        } else {
          onCancel();
        }
      }}
    >
      <Pressable style={styles.backdrop} onPress={() => currentView === 'main' ? onCancel() : goBack()}>
        <TouchableWithoutFeedback>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom }]}
            onPress={() => {}}
          >
            {currentView === 'main' && (
              <>
                <Text style={styles.title}>{t('setUpGoals')}</Text>

                <Text style={styles.label}>{t('goalsTitle')}</Text>
                <TextInput
                  style={styles.input}
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                  placeholder={t('addGoalsTitle')}
                  placeholderTextColor={lightColors.subText}
                />

                <Text style={styles.label}>{t('category')}</Text>
                <TouchableOpacity
                  style={styles.inputRow}
                  onPress={() => setCurrentView('category')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.inputRowText, !category && styles.placeholder]}
                    numberOfLines={1}
                  >
                    {category ?? t('category')}
                  </Text>
                  <BottomArrowIcon width={12} height={8} />
                </TouchableOpacity>

                <Text style={styles.label}>{t('goalsDueDate')}</Text>
                <TouchableOpacity
                  style={styles.inputRow}
                  onPress={() => setCurrentView('dueDate')}
                  activeOpacity={0.7}
                >
                  <CalendarIcon width={20} height={20} />
                  <Text
                    style={[styles.inputRowTextFlex, !dueDate && styles.placeholder]}
                    numberOfLines={1}
                  >
                    {dueDate ? formatDate(dueDate) : t('goalsDueDate')}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setDueDate(null);
                      }}
                      style={styles.clearBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                <Text style={styles.label}>{t('goalsReminder')}</Text>
                <TouchableOpacity
                  style={styles.inputRow}
                  onPress={() => setCurrentView('reminderDate')}
                  activeOpacity={0.7}
                >
                  <TimeIcon width={20} height={20} />
                  <Text
                    style={[styles.inputRowTextFlex, !reminderDisplay && styles.placeholder]}
                    numberOfLines={1}
                  >
                    {reminderDisplay || t('goalsReminder')}
                  </Text>
                  {reminderDisplay && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setReminderDate(null);
                        setReminderTime(null);
                      }}
                      style={styles.clearBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                <View style={styles.actions}>
                  <Button
                    title={t('cancel')}
                    variant="outline"
                    onPress={onCancel}
                    style={styles.cancelBtn}
                    backgroundColor={lightColors.skipbg}
                    textColor={lightColors.accent}
                    borderWidth={0}
                  />
                  <Button
                    title={t('ok')}
                    variant="primary"
                    onPress={handleOK}
                    style={styles.okBtn}
                    backgroundColor={lightColors.accent}
                    textColor={lightColors.secondaryBackground}
                  />
                </View>
              </>
            )}

            {currentView === 'category' && (
              <CategoryPickerContent
                selectedCategory={category}
                onSelect={setCategory}
                onCancel={goBack}
                onConfirm={goBack}
                t={t}
              />
            )}

            {currentView === 'dueDate' && (
              <CalendarContent
                title={t('goalsDueDate')}
                selectedDate={dueDate}
                onSelect={setDueDate}
                onCancel={goBack}
                onConfirm={goBack}
                t={t}
              />
            )}

            {currentView === 'reminderDate' && (
              <CalendarContent
                title={t('goalsReminder')}
                selectedDate={reminderDate}
                onSelect={setReminderDate}
                onCancel={goBack}
                onConfirm={() => setCurrentView('reminderTime')}
                t={t}
              />
            )}

            {currentView === 'reminderTime' && (
              <TimePickerContent
                title={t('goalsReminder')}
                initialTime={
                  reminderTime
                    ? { hours: reminderTime.hours, minutes: reminderTime.minutes, am: reminderTime.am }
                    : { hours: 10, minutes: 0, am: true }
                }
                onCancel={goBack}
                onConfirm={(hours, minutes, am) => {
                  setReminderTime({ hours, minutes, am });
                  goBack();
                }}
                t={t}
              />
            )}
          </Pressable>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
};

export default SetUpGoalsModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: lightColors.blurBackground,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
    marginBottom: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 24,
  },
  inputRowText: {
    flex: 1,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.text,
  },
  inputRowTextFlex: {
    flex: 1,
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    // marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 1000,
  },
  okBtn: {
    flex: 1,
    borderRadius: 1000,
  },
});

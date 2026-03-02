import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import { t, useTranslation } from '../i18n';

const ROW_HEIGHT = 93;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PADDING_TOP = ROW_HEIGHT * 2;

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  initialTime?: { hours: number; minutes: number; am: boolean };
  onCancel: () => void;
  onConfirm: (hours: number, minutes: number, am: boolean) => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  title,
  initialTime = { hours: 10, minutes: 0, am: true },
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [am, setAm] = useState(initialTime.am);
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const scrollToHour = useCallback(
    (h: number) => {
      const y = (h - 1) * ROW_HEIGHT;
      hoursScrollRef.current?.scrollTo({ y, animated: true });
    },
    []
  );
  const scrollToMinute = useCallback((m: number) => {
    const y = m * ROW_HEIGHT;
    minutesScrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  useEffect(() => {
    if (visible) {
      setHours(initialTime.hours);
      setMinutes(initialTime.minutes);
      setAm(initialTime.am);
      setTimeout(() => {
        scrollToHour(initialTime.hours);
        scrollToMinute(initialTime.minutes);
      }, 50);
    }
  }, [visible, initialTime.hours, initialTime.minutes, initialTime.am, scrollToHour, scrollToMinute]);

  const getScrollIndex = (offsetY: number) => {
    return Math.round(offsetY / ROW_HEIGHT);
  };

  const handleHoursScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = getScrollIndex(y);
    const clamped = Math.max(0, Math.min(11, index));
    setHours(clamped + 1);
  };
  const handleMinutesScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = getScrollIndex(y);
    const clamped = Math.max(0, Math.min(59, index));
    setMinutes(clamped);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onPress={() => {}}
        >
          {/* Header: back arrow + title (Image 3) */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <BackArrowIcon width={24} height={24} />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Picker body: selection highlight (orange lines) + columns */}
          <View style={styles.pickerContainer}>
            <View style={styles.selectionHighlight}>
              <View style={styles.selectionLine} />
              <View style={styles.selectionLine} />
            </View>
            <View style={styles.pickerRow}>
              <View style={styles.columnWrap}>
                <ScrollView
                  ref={hoursScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleHoursScroll}
                  onScrollEndDrag={handleHoursScroll}
                  contentContainerStyle={{
                    paddingTop: PADDING_TOP,
                    paddingBottom: PADDING_TOP,
                  }}
                  style={styles.column}
                >
                  {hoursList.map((h) => (
                    <View key={h} style={[styles.row, { height: ROW_HEIGHT }]}>
                      <Text
                        style={[
                          styles.rowTextInactive,
                          hours === h && styles.rowTextSelected,
                        ]}
                      >
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.colonWrap}>
                <Text style={styles.colonSelected}>:</Text>
              </View>
              <View style={styles.columnWrap}>
                <ScrollView
                  ref={minutesScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleMinutesScroll}
                  onScrollEndDrag={handleMinutesScroll}
                  contentContainerStyle={{
                    paddingTop: PADDING_TOP,
                    paddingBottom: PADDING_TOP,
                  }}
                  style={styles.column}
                >
                  {minutesList.map((m) => (
                    <View key={m} style={[styles.row, { height: ROW_HEIGHT }]}>
                      <Text
                        style={[
                          styles.rowTextInactive,
                          minutes === m && styles.rowTextSelected,
                        ]}
                      >
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.amPmWrap}>
                <Text style={styles.amPmText}>{am ? 'AM' : 'PM'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title={t("cancel")}
              variant="outline"
              onPress={onCancel}
              style={styles.cancelBtn}
              borderWidth={0}
              backgroundColor={lightColors.skipbg}
              textColor={lightColors.background}
            />
            <Button
              title={t("ok")}
              variant="primary"
              onPress={() => onConfirm(hours, minutes, am)}
              style={styles.okBtn}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 2, 2, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    position: 'relative',
    marginBottom: 24,
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ROW_HEIGHT * 2,
    height: ROW_HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: 2,
    pointerEvents: 'none',
    zIndex: 1,
  },
  selectionLine: {
    height: 2,
    backgroundColor: lightColors.background,
    marginHorizontal: 0,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PICKER_HEIGHT,
  },
  columnWrap: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  column: {
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextInactive: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 32,
    color: palette.gray500,
  },
  rowTextSelected: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 48,
    color: lightColors.background,
  },
  colonWrap: {
    paddingHorizontal: 40,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colonSelected: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.background,
  },
  amPmWrap: {
    paddingHorizontal: 12,
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  amPmText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 18,
    color: lightColors.placeholderText,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 24,  },
  cancelBtn: {
    flex: 1,
    borderRadius: 100,
  },
  okBtn: {
    flex: 1,
    borderRadius: 100,
  },
});

export default TimePickerModal;

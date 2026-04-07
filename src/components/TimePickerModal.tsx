import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Header from './Header';
import Button from './Button';
import BackArrowIcon from '../assets/svgs/BackArrowIcon';
import { useTranslation } from '../i18n';

const PICKER_HEIGHT = 280;
const WHEEL_WIDTH_HOUR = 72;
const WHEEL_WIDTH_MINUTE = 72;
const WHEEL_WIDTH_AMPM = 80;

/** Light purple background for selected AM/PM (matches image). */
const AM_PM_SELECTED_BG = lightColors.background;

const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  label: (i + 1).toString().padStart(2, '0'),
  value: i + 1,
}));

const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i,
}));

const AM_PM_ITEMS = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  initialTime?: { hours: number; minutes: number; am: boolean };
  onCancel: () => void;
  onConfirm: (hours: number, minutes: number, am: boolean) => void;
}

export interface TimePickerContentProps {
  title: string;
  initialTime: { hours: number; minutes: number; am: boolean };
  onCancel: () => void;
  onConfirm: (hours: number, minutes: number, am: boolean) => void;
  t: (key: string) => string;
}

export const TimePickerContent: React.FC<TimePickerContentProps> = ({
  title,
  initialTime,
  onCancel,
  onConfirm,
  t,
}) => {
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [am, setAm] = useState(initialTime.am);

  const selectedHourLabel = hours.toString().padStart(2, '0');
  const selectedMinuteLabel = minutes.toString().padStart(2, '0');
  const selectedAmPmLabel = am ? 'AM' : 'PM';

  const pickerKey = `${initialTime.hours}-${initialTime.minutes}-${initialTime.am}`;

  const renderWheelItem = (selectedLabel: string, selectedColor: string) => {
    return (props: { fontSize: number; label: string; textAlign: string }) => {
      const isSelected = props.label === selectedLabel;
      const unselectedGray = lightColors.placeholderText;
      return (
        <Text
          style={[
            styles.wheelItemText,
            {
              fontSize: isSelected ? 48 : props.fontSize,
              color: isSelected ? selectedColor : unselectedGray,
              fontFamily: isSelected
                ? fontFamilies.urbanistBold
                : fontFamilies.urbanistMedium,
            },
          ]}
        >
          {props.label}
        </Text>
      );
    };
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Header
          leftIcon={<BackArrowIcon width={24} height={24} />}
          title={title}
          rightIcon={<View style={styles.headerSpacer} />}
          onLeftPress={onCancel}
        />
      </View>

      <View style={styles.pickerSection}>
        <View style={styles.wheelsRow}>
          <View style={styles.wheelWrap}>
            <WheelPickerExpo
              key={`hour-${pickerKey}`}
              height={PICKER_HEIGHT}
              width={WHEEL_WIDTH_HOUR}
              initialSelectedIndex={hours - 1}
              items={HOUR_ITEMS}
              backgroundColor={lightColors.secondaryBackground}
              selectedStyle={{
                borderColor: lightColors.background,
                borderWidth: 2,
              }}
              onChange={({ item }) => setHours(Number(item.label))}
              renderItem={renderWheelItem(
                selectedHourLabel,
                lightColors.background,
                lightColors.placeholderText
              )}
            />
          </View>

          <View style={styles.colonWrap}>
            <Text style={styles.colon}>:</Text>
          </View>

          <View style={styles.wheelWrap}>
            <WheelPickerExpo
              key={`minute-${pickerKey}`}
              height={PICKER_HEIGHT}
              width={WHEEL_WIDTH_MINUTE}
              initialSelectedIndex={minutes}
              items={MINUTE_ITEMS}
              backgroundColor={lightColors.secondaryBackground}
              selectedStyle={{
                borderColor: lightColors.background,
                borderWidth: 2,
              }}
              onChange={({ item }) => setMinutes(Number(item.label))}
              renderItem={renderWheelItem(
                selectedMinuteLabel,
                lightColors.background,
                lightColors.placeholderText
              )}
            />
          </View>

          <View style={styles.wheelWrap}>
            <WheelPickerExpo
              key={`ampm-${pickerKey}`}
              height={PICKER_HEIGHT}
              width={WHEEL_WIDTH_AMPM}
              initialSelectedIndex={am ? 0 : 1}
              items={AM_PM_ITEMS}
              backgroundColor={lightColors.secondaryBackground}
              selectedStyle={{
                borderColor: lightColors.background,
                borderWidth: 2,
              }}
              onChange={({ index }) => setAm(index === 0)}
              renderItem={renderWheelItem(
                selectedAmPmLabel,
                lightColors.background,
                lightColors.placeholderText
              )}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button
          title={t('cancel')}
          onPress={onCancel}
          style={styles.cancelBtn}
          backgroundColor={lightColors.skipbg}
          textColor={lightColors.accent}
        />
        <Button
          title={t('ok')}
          onPress={() => onConfirm(hours, minutes, am)}
          style={styles.okBtn}
          backgroundColor={lightColors.accent}
          textColor={lightColors.secondaryBackground}
        />
      </View>
    </>
  );
};

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

  const syncFromInitial = useCallback(() => {
    setHours(initialTime.hours);
    setMinutes(initialTime.minutes);
    setAm(initialTime.am);
  }, [initialTime.hours, initialTime.minutes, initialTime.am]);

  useEffect(() => {
    if (visible) {
      syncFromInitial();
    }
  }, [visible, syncFromInitial]);

  const selectedHourLabel = hours.toString().padStart(2, '0');
  const selectedMinuteLabel = minutes.toString().padStart(2, '0');
  const selectedAmPmLabel = am ? 'AM' : 'PM';

  const pickerKey = `${initialTime.hours}-${initialTime.minutes}-${initialTime.am}`;

  const renderWheelItem = (selectedLabel: string, selectedColor: string) => {
    return (props: { fontSize: number; label: string; textAlign: string }) => {
      const isSelected = props.label === selectedLabel;
      const unselectedGray = lightColors.placeholderText;
      return (
        <Text
          style={[
            styles.wheelItemText,
            {
              fontSize: isSelected ? 48 : props.fontSize,
              color: isSelected ? selectedColor : unselectedGray,
              fontFamily: isSelected
                ? fontFamilies.urbanistBold
                : fontFamilies.urbanistMedium,
            },
          ]}
        >
          {props.label}
        </Text>
      );
    };
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onPress={() => {}}
        >
          <View style={styles.headerContainer}>
            <Header
              leftIcon={<BackArrowIcon width={24} height={24} />}
              title={title}
              rightIcon={<View style={styles.headerSpacer} />}
              onLeftPress={onCancel}
            />
          </View>

          <View style={styles.pickerSection}>
            <View style={styles.wheelsRow}>
              <View style={styles.wheelWrap}>
                <WheelPickerExpo
                  key={`hour-${pickerKey}`}
                  height={PICKER_HEIGHT}
                  width={WHEEL_WIDTH_HOUR}
                  initialSelectedIndex={hours - 1}
                  items={HOUR_ITEMS}
                  backgroundColor={lightColors.secondaryBackground}
                  selectedStyle={{
                    borderColor: lightColors.background,
                    borderWidth: 2,
                  }}
                  onChange={({ item }) => setHours(Number(item.label))}
                  renderItem={renderWheelItem(
                    selectedHourLabel,
                    lightColors.background,
                    lightColors.placeholderText
                  )}
                />
              </View>

              <View style={styles.colonWrap}>
                <Text style={styles.colon}>:</Text>
              </View>

              <View style={styles.wheelWrap}>
                <WheelPickerExpo
                  key={`minute-${pickerKey}`}
                  height={PICKER_HEIGHT}
                  width={WHEEL_WIDTH_MINUTE}
                  initialSelectedIndex={minutes}
                  items={MINUTE_ITEMS}
                  backgroundColor={lightColors.secondaryBackground}
                  selectedStyle={{
                    borderColor: lightColors.background,
                    borderWidth: 2,
                  }}
                  onChange={({ item }) => setMinutes(Number(item.label))}
                  renderItem={renderWheelItem(
                    selectedMinuteLabel,
                    lightColors.background,
                    lightColors.placeholderText
                  )}
                />
              </View>

              <View style={styles.wheelWrap}>
                <WheelPickerExpo
                  key={`ampm-${pickerKey}`}
                  height={PICKER_HEIGHT}
                  width={WHEEL_WIDTH_AMPM}
                  initialSelectedIndex={am ? 0 : 1}
                  items={AM_PM_ITEMS}
                  backgroundColor={lightColors.secondaryBackground}
                  selectedStyle={{
                    borderColor: lightColors.background,
                    borderWidth: 2,
                  }}
                  onChange={({ index }) => setAm(index === 0)}
                  renderItem={renderWheelItem(
                    selectedAmPmLabel,
                    lightColors.background,
                    lightColors.placeholderText
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title={t('cancel')}
              onPress={onCancel}
              style={styles.cancelBtn}
              backgroundColor={lightColors.skipbg}
              textColor={lightColors.accent}
            />
            <Button
              title={t('ok')}
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

export default TimePickerModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: lightColors.blurBackground,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 40,
    height: 44,
   
  },
  pickerSection: {
    marginTop: 8,
    marginBottom: 28,
    
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  wheelWrap: {
    overflow: 'hidden',
    height: 300,
    justifyContent: 'center',
    // backgroundColor: 'blue',
  },
  colonWrap: {
    paddingHorizontal: 6,
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    // backgroundColor: 'green',
  },
  colon: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 48,
    color: lightColors.background,
  },
  wheelItemText: {
    textAlign: 'center',
  },
  amPmSelectedWrap: {
    backgroundColor: AM_PM_SELECTED_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 100,
  },
  okBtn: {
    flex: 1,
    borderRadius: 100,
  },
});

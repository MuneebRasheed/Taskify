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
import { useTranslation } from '../i18n';

const ROW_HEIGHT = 93;
const PICKER_HEIGHT = ROW_HEIGHT * 5;
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

  const scrollToHour = useCallback((h: number) => {
    const y = (h - 1) * ROW_HEIGHT;
    hoursScrollRef.current?.scrollTo({ y, animated: false });
  }, []);

  const scrollToMinute = useCallback((m: number) => {
    const y = m * ROW_HEIGHT;
    minutesScrollRef.current?.scrollTo({ y, animated: false });
  }, []);

  useEffect(() => {
    if (visible) {
      setHours(initialTime.hours);
      setMinutes(initialTime.minutes);
      setAm(initialTime.am);

      requestAnimationFrame(() => {
        scrollToHour(initialTime.hours);
        scrollToMinute(initialTime.minutes);
      });
    }
  }, [visible]);

  const getIndex = (offsetY: number) => Math.round(offsetY / ROW_HEIGHT);

  const handleHoursScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(11, getIndex(y)));

    setHours(index + 1);

    hoursScrollRef.current?.scrollTo({
      y: index * ROW_HEIGHT,
      animated: true,
    });
  };

  const handleMinutesScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(59, getIndex(y)));

    setMinutes(index);

    minutesScrollRef.current?.scrollTo({
      y: index * ROW_HEIGHT,
      animated: true,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
              <BackArrowIcon width={24} height={24} />
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>

            <View style={{ width: 32 }} />
          </View>

          {/* Picker */}
          <View style={styles.pickerContainer}>
            <View style={styles.selectionHighlight}>
              <View style={styles.selectionLine} />
              <View style={styles.selectionLine} />
            </View>

            <View style={styles.pickerRow}>
              {/* HOURS */}
              <View style={styles.columnWrap}>
                <ScrollView
                  ref={hoursScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleHoursScroll}
                  contentContainerStyle={{
                    paddingTop: PADDING_TOP,
                    paddingBottom: PADDING_TOP,
                  }}
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

              {/* COLON */}
              <View style={styles.colonWrap}>
                <Text style={styles.colonSelected}>:</Text>
              </View>

              {/* MINUTES */}
              <View style={styles.columnWrap}>
                <ScrollView
                  ref={minutesScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleMinutesScroll}
                  contentContainerStyle={{
                    paddingTop: PADDING_TOP,
                    paddingBottom: PADDING_TOP,
                  }}
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

              {/* AM PM */}
              <View style={styles.amPmWrap}>
                <TouchableOpacity onPress={() => setAm(true)}>
                  <Text
                    style={[
                      styles.amPmText,
                      am && styles.amPmSelected,
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setAm(false)}>
                  <Text
                    style={[
                      styles.amPmText,
                      !am && styles.amPmSelected,
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Button
              title={t('cancel')}
              onPress={onCancel}
              style={styles.cancelBtn}
              backgroundColor={lightColors.skipbg}
              textColor={lightColors.background}
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
    backgroundColor: 'rgba(2,2,2,0.4)',
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

  pickerContainer: {
    height: PICKER_HEIGHT,
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
    zIndex: 1,
  },

  selectionLine: {
    height: 2,
    backgroundColor: lightColors.background,
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

  row: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 32,
    height: PICKER_HEIGHT,
    justifyContent: 'center',
  },

  colonSelected: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 36,
    color: lightColors.background,
  },

  amPmWrap: {
    justifyContent: 'center',
    marginLeft: 10,
  },

  amPmText: {
    fontSize: 18,
    color: palette.gray500,
    marginVertical: 6,
  },

  amPmSelected: {
    color: lightColors.background,
    fontWeight: 'bold',
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


















// import React, { useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from "react-native";
// import WheelPickerExpo from "react-native-wheel-picker-expo";

// const { width } = Dimensions.get("window");

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onConfirm: (time: string) => void;
// }

// const hours = Array.from({ length: 12 }, (_, i) =>
//   String(i + 1).padStart(2, "0")
// );

// const minutes = Array.from({ length: 60 }, (_, i) =>
//   String(i).padStart(2, "0")
// );

// const ampm = ["AM", "PM"];

// export default function TimePickerModal({
//   visible,
//   onClose,
//   onConfirm,
// }: Props) {
//   const [hourIndex, setHourIndex] = useState(9);
//   const [minuteIndex, setMinuteIndex] = useState(0);
//   const [ampmIndex, setAmpmIndex] = useState(0);

//   const handleConfirm = () => {
//     const time = `${hours[hourIndex]}:${minutes[minuteIndex]} ${ampm[ampmIndex]}`;
//     onConfirm(time);
//   };

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View style={styles.overlay}>
//         <View style={styles.container}>
          
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Goals Reminder</Text>
//           </View>

//           {/* Picker */}
//           <View style={styles.pickerRow}>
            
//             {/* Hours */}
//             <WheelPickerExpo
//               height={200}
//               width={width / 3}
//               initialSelectedIndex={hourIndex}
//               items={hours.map((h) => ({ label: h, value: h }))}
//               onChange={({ index }) => setHourIndex(index)}
//             />

//             <Text style={styles.colon}>:</Text>

//             {/* Minutes */}
//             <WheelPickerExpo
//               height={200}
//               width={width / 3}
//               initialSelectedIndex={minuteIndex}
//               items={minutes.map((m) => ({ label: m, value: m }))}
//               onChange={({ index }) => setMinuteIndex(index)}
//             />

//             {/* AM PM */}
//             <WheelPickerExpo
//               height={200}
//               width={80}
//               initialSelectedIndex={ampmIndex}
//               items={ampm.map((a) => ({ label: a, value: a }))}
//               onChange={({ index }) => setAmpmIndex(index)}
//             />
//           </View>

//           {/* Buttons */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.okBtn} onPress={handleConfirm}>
//               <Text style={styles.okText}>OK</Text>
//             </TouchableOpacity>
//           </View>

//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },

//   container: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     paddingVertical: 20,
//   },

//   header: {
//     alignItems: "center",
//     marginBottom: 20,
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "600",
//   },

//   pickerRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   colon: {
//     fontSize: 32,
//     marginHorizontal: 5,
//     fontWeight: "600",
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },

//   cancelBtn: {
//     flex: 1,
//     marginRight: 10,
//     padding: 14,
//     borderRadius: 30,
//     backgroundColor: "#F2E4ED",
//     alignItems: "center",
//   },

//   okBtn: {
//     flex: 1,
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     backgroundColor: "#A33EA1",
//     alignItems: "center",
//   },

//   cancelText: {
//     color: "#A33EA1",
//     fontWeight: "600",
//   },

//   okText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });
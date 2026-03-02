import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import LeftArrowIcon from '../assets/svgs/LeftArrowIcon';
import RightArrowIcon from '../assets/svgs/RightArrowIcon';
import Textt from '../components/Textt';


const DAYS_HEADER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type Cell = { day: number; isCurrentMonth: boolean };

function getDaysInMonth(year: number, month: number): Cell[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startDay = first.getDay();
  const prevMonth = new Date(year, month, 0);
  const prevDays = prevMonth.getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ day: prevDays - startDay + 1 + i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let n = 1; n <= remaining; n++) {
    cells.push({ day: n, isCurrentMonth: false });
  }
  const rows: Cell[][] = [];
  for (let r = 0; r < 6; r++) {
    rows.push(cells.slice(r * 7, (r + 1) * 7));
  }
  return rows;
}

interface CalendarModalProps {
  visible: boolean;
  title: string;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  title,
  selectedDate,
  onSelect,
  onCancel,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const grid = useMemo(
    () => getDaysInMonth(year, month),
    [year, month]
  );

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom}]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>{title}</Text>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <LeftArrowIcon width={20} height={20} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{`${monthName} ${year}`}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <RightArrowIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {DAYS_HEADER.map((d) => (
              <Text key={d} style={styles.weekHeader}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {grid.map((row, ri) =>
              row.map((cell, ci) => {
                const sel =
                  selectedDate &&
                  cell.isCurrentMonth &&
                  selectedDate.getDate() === cell.day &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;
                return (
                  <TouchableOpacity
                    key={`${ri}-${ci}`}
                    style={styles.cell}
                    onPress={() => {
                      if (cell.isCurrentMonth) {
                        onSelect(new Date(year, month, cell.day));
                      } else {
                        if (ri === 0) {
                          onSelect(new Date(year, month - 1, cell.day));
                        } else {
                          onSelect(new Date(year, month + 1, cell.day));
                        }
                      }
                    }}
                  >
                    <View style={[styles.cellInner, sel && styles.cellSelected]}>
                      <Text
                        style={[
                          styles.cellText,
                          !cell.isCurrentMonth && styles.cellTextMuted,
                          sel && styles.cellTextSelected,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
          <View style={styles.buttons}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              style={styles.cancelBtn}
              borderWidth={0}
              backgroundColor={lightColors.skipbg}
              textColor={lightColors.background}
            />
            <Button
              title="OK"
              variant="primary"
              onPress={onConfirm}
              style={styles.okBtn}
              backgroundColor={lightColors.accent}
              textColor={lightColors.secondaryBackground}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 3, 3, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  arrowBtn: {
    padding: 8,
  },
  arrow: {
    fontSize: 20,
    color: lightColors.placeholderText,
    fontWeight: '600',
  },
  monthText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.text,
  },
  weekRow: {
  
    
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeader: {
    flex: 1,
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 18,
    color: lightColors.text,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: lightColors.background,
  },
  cellText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.text,
  },
  cellTextMuted: {
    color: lightColors.placeholderText,
  },
  cellTextSelected: {
    color: lightColors.secondaryBackground,
  },
  buttons: {
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 24,
    flexDirection: 'row',
    gap: 12,
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

export default CalendarModal;

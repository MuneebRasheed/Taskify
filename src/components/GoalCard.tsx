import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

const CARD_IMAGE_SIZE = 96;

function daysUntilDue(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export interface GoalCardProps {
  /** Cover image source (e.g. from COVER_IMAGE_SOURCES[goal.coverIndex]) */
  coverSource: ImageSourcePropType;
  title: string;
  habitsDone: number;
  habitsTotal: number;
  tasksDone: number;
  tasksTotal: number;
  /** Optional due date; when set, shows "D-X days" row */
  dueDate?: Date | null;
  /** When provided, the card is pressable */
  onPress?: () => void;
  /** Optional container style override */
  style?: ViewStyle;
}

const GoalCard: React.FC<GoalCardProps> = ({
  coverSource,
  title,
  habitsDone,
  habitsTotal,
  tasksDone,
  tasksTotal,
  dueDate,
  onPress,
  style,
}) => {
  const content = (
    <>
      <Image
        source={coverSource}
        style={styles.goalCardImage}
        resizeMode="cover"
      />
      <View style={styles.goalCardBody}>
        <Text style={styles.goalCardTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.tagsRow}>
          <View style={styles.habitTag}>
            <Text style={styles.habitTagText}>
              Habits {habitsDone}/{habitsTotal}
            </Text>
          </View>
          <View style={styles.taskTag}>
            <Text style={styles.taskTagText}>
              Tasks {tasksDone}/{tasksTotal}
            </Text>
          </View>
        </View>
        {dueDate != null && (
          <View style={styles.daysRow}>
            <Ionicons name="calendar-outline" size={14} color={lightColors.subText} />
            <Text style={styles.daysText}>
              D-{daysUntilDue(dueDate)} days
            </Text>
          </View>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.goalCard, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.goalCard, style]}>{content}</View>;
};

export default GoalCard;

const styles = StyleSheet.create({
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalCardImage: {
    width: CARD_IMAGE_SIZE,
    height: CARD_IMAGE_SIZE,
    borderRadius: 10,
    backgroundColor: lightColors.inputBackground,
  },
  goalCardBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    minWidth: 0,
  },
  goalCardTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.text,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  habitTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.habitIndicator,
  },
  taskTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.taskIndicator,
  },
  habitTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.habitIndicator,
  },
  taskTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 12,
    color: lightColors.taskIndicator,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
  },
});

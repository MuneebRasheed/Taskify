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
import AddIcon from '../assets/svgs/AddIcon';
import UserIcon from '../assets/svgs/UserIcon';

const CARD_IMAGE_HEIGHT = 96;

function daysUntilDue(d: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export interface GoalCardProps {
  /** Cover image source (e.g. from COVER_IMAGE_SOURCES[goal.coverIndex] or goal.coverImage) */
  coverSource: ImageSourcePropType;
  title: string;
  /** Pre-made style: show "Habits N", "Tasks N". Pass same as habitsTotal/tasksTotal if no progress. */
  habitsCount?: number;
  tasksCount?: number;
  /** My-goals style: show "Habits done/total", "Tasks done/total". Overrides count when set. */
  habitsDone?: number;
  habitsTotal?: number;
  tasksDone?: number;
  tasksTotal?: number;
  /** Optional user count line (e.g. "+15.2K users") with people icon */
  userCount?: string;
  /** Optional due date; when set, shows "D-X days" row (for my goals) */
  dueDate?: Date | null;
  /** When true, card is dimmed (e.g. pre-made goal already added); add button is hidden */
  dimmed?: boolean;
  /** When provided, the card is pressable */
  onPress?: () => void;
  /** When provided, shows circular add button on the right (pre-made goals). Omit when dimmed/already added. */
  onAddPress?: (e?: any) => void;
  /** Optional container style override */
  style?: ViewStyle;
}

const GoalCard: React.FC<GoalCardProps> = ({
  coverSource,
  title,
  habitsCount = 0,
  tasksCount = 0,
  habitsDone,
  habitsTotal,
  tasksDone,
  tasksTotal,
  userCount,
  dueDate,
  dimmed,
  onPress,
  onAddPress,
  style,
}) => {
  const showProgress = habitsDone !== undefined && habitsTotal !== undefined && tasksDone !== undefined && tasksTotal !== undefined;
  const habitsLabel = showProgress ? `Habits ${habitsDone}/${habitsTotal}` : `Habits ${habitsCount}`;
  const tasksLabel = showProgress ? `Tasks ${tasksDone}/${tasksTotal}` : `Tasks ${tasksCount}`;
  const showAddButton = !dimmed && onAddPress != null;

  const content = (
    <>
      {/* Left: illustration area with pale background */}
      <View style={styles.imageWrap}>
        <Image
          source={coverSource}
          style={styles.goalCardImage}
          resizeMode="cover"
        />
      </View>

      {/* Right: title, tags, user count / due, optional add button */}
      <View style={styles.bodyWrap}>
        <Text style={styles.goalCardTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.tagsRow}>
          <View style={styles.habitTag}>
            <Text style={styles.habitTagText}>{habitsLabel}</Text>
          </View>
          <View style={styles.taskTag}>
            <Text style={styles.taskTagText}>{tasksLabel}</Text>
          </View>
        </View>
        {userCount != null && userCount !== '' && (
          <View style={styles.userCountRow}>
            <UserIcon width={16} height={16} />
            <Text style={styles.userCountText}>{userCount}</Text>
          </View>
        )}
        {userCount == null && dueDate != null && (
          <View style={styles.daysRow}>
            <Ionicons name="calendar-outline" size={14} color={lightColors.subText} />
            <Text style={styles.daysText}>D-{daysUntilDue(dueDate)} days</Text>
          </View>
        )}
      </View>

      {showAddButton && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={(e) => {
            e?.stopPropagation?.();
            onAddPress?.(e);
          }}
          activeOpacity={0.8}
        >
          <AddIcon width={20} height={20} />
        </TouchableOpacity>
      )}
    </>
  );

  const cardStyle = [styles.goalCard, dimmed && styles.goalCardDimmed, style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

export default GoalCard;

const styles = StyleSheet.create({
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.secondaryBackground,
    marginBottom: 16,
    gap: 16,
    minHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 16,
  },
  goalCardDimmed: {
    opacity: 0.6,
  },
  imageWrap: {
    width: '38%',
    minWidth: 120,
    maxWidth: 120,
    height: CARD_IMAGE_HEIGHT,
    borderRadius: 6,
    backgroundColor: '#FAF8F5',
    overflow: 'hidden',
  },
  goalCardImage: {
    width: '100%',
    height: '100%',
  },
  bodyWrap: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    minWidth: 0,
  },
  goalCardTitle: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.text,
    marginBottom: 8,
  },
  tagsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  habitTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: lightColors.habitIndicator,
  },
  habitTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 10,
    color: lightColors.habitIndicator,
  },
  taskTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: lightColors.taskIndicator,
  },
  taskTagText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 10,
    color: lightColors.taskIndicator,
  },
  userCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  userCountText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 12,
    color: lightColors.subText,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.skipbg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

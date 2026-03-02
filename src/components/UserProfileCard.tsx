import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { lightColors } from '../../utils/colors';
import ArrowSetting from '../assets/svgs/ArrowSetting';
import { fontFamilies } from '../theme/typography';

export type UserProfileStats = {
  goalsAchieved: number;
  habitsFormed: number;
  tasksFinished: number;
};

export type UserProfileCardProps = {
  /** Display name */
  name: string;
  /** Email address */
  email: string;
  /** Optional avatar image; if not provided, a placeholder is shown */
  avatarUri?: ImageSourcePropType | string | null;
  /** Stats to show: goals, habits, tasks */
  stats: UserProfileStats;
  /** Labels for stats; defaults: "Total goals achieved", "Total formed habits", "Total finished tasks" */
  statsLabels?: {
    goals?: string;
    habits?: string;
    tasks?: string;
  };
  onPress?: () => void;
};

const DEFAULT_STATS_LABELS = {
  goals: 'Total goals achieved',
  habits: 'Total formed habits',
  tasks: 'Total finished tasks',
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  email,
  avatarUri,
  stats,
  statsLabels = DEFAULT_STATS_LABELS,
  onPress,
}) => {
  const labels = { ...DEFAULT_STATS_LABELS, ...statsLabels };
  const avatarSource =
    typeof avatarUri === 'string' ? { uri: avatarUri } : avatarUri;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.profileRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
        <ArrowSetting
          width={24}
          height={24}
          color={lightColors.text}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.goalsAchieved}</Text>
          <Text style={styles.statLabel}>{labels.goals}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.habitsFormed}</Text>
          <Text style={styles.statLabel}>{labels.habits}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.tasksFinished}</Text>
          <Text style={styles.statLabel}>{labels.tasks}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: lightColors.BtnBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.background,
  },
  profileInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 16,
    color: lightColors.smallText,
    marginBottom: 2,
  },
  email: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 14,
    color: lightColors.subText,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    alignSelf: 'stretch',
  },
  statValue: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 20,
    color: lightColors.smallText,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 10,
    color: lightColors.subText,
    textAlign: 'center',
  },
});

export default UserProfileCard;

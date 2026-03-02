import React from 'react';
import { View, StyleSheet } from 'react-native';
import { lightColors } from '../../utils/colors';
import SettingsListItem from './SettingsListItem';
import Textt from './Textt';                                
export type AccountSettingsItem = {
  /** Ionicons name (used when icon is not provided) */
  iconName?: string;
  /** Custom icon component */
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  /** Use for Logout etc. */
  accent?: boolean;
};

export type AccountSettingsCardProps = {
  items: AccountSettingsItem[];
};

const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({ items }) => {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <View style={styles.separator} />}
          <SettingsListItem
            iconName={item.iconName}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            accent={item.accent}
          />
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  separator: {
    height: 1,
    backgroundColor: lightColors.border,
  },
});

export default AccountSettingsCard;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import HomeIcon from '../assets/svgs/HomeIcon';
import Explore from '../assets/svgs/Explore';
import Report from '../assets/svgs/Report';
import MyGoals from '../assets/svgs/MyGoals';
import Account from '../assets/svgs/Account';
import ActiveHomeIcon from '../assets/svgs/ActiveHomeIcon';
import ActiveExploreIcon from '../assets/svgs/ActiveExploreIcon';
import ActiveReportIcon from '../assets/svgs/ActiveReportIcon';
import ActiveMyGoalsIcon from '../assets/svgs/ActiveMyGoalsIcone';
import ActiveAccountIcon from '../assets/svgs/ActiveAccountIcon';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

const TABS = [
  { id: 'Home', label: 'Home', Icon: HomeIcon, ActiveIcon: ActiveHomeIcon, screen: 'HomeScreen' as const },
  { id: 'Explore', label: 'Explore', Icon: Explore, ActiveIcon: ActiveExploreIcon, screen: 'HomeScreen' as const },
  { id: 'Report', label: 'Report', Icon: Report, ActiveIcon: ActiveReportIcon, screen: 'HomeScreen' as const },
  { id: 'My Goals', label: 'My Goals', Icon: MyGoals, ActiveIcon: ActiveMyGoalsIcon, screen: 'MyGoalsScreen' as const },
  { id: 'Account', label: 'Account', Icon: Account, ActiveIcon: ActiveAccountIcon, screen: 'HomeScreen' as const },
];

const ACTIVE_PURPLE = lightColors.accent;
const INACTIVE_GRAY = lightColors.placeholderText;

const ICON_SIZE = 24;

interface BottomNavigationProps {
  activeTab?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab = 'Home' }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleTabPress = (tab: (typeof TABS)[number]) => {
    navigation.navigate(tab.screen);
  };

  return (
    <View style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = isActive ? tab.ActiveIcon : tab.Icon;
          const labelColor = isActive ? ACTIVE_PURPLE : INACTIVE_GRAY;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                {isActive ? (
                  <IconComponent width={ICON_SIZE} height={ICON_SIZE} />
                ) : (
                  <IconComponent
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    color={INACTIVE_GRAY}
                  />
                )}
              </View>
              <Text style={[styles.label, { color: labelColor }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: lightColors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: lightColors.secondaryBackground,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: fontFamilies.urbanistMedium,
  },
});

export default BottomNavigation;

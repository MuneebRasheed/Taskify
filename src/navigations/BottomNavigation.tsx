import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeIcon from '../assets/svgs/HomeIcon';
import Explore from '../assets/svgs/Explore';
import Report from '../assets/svgs/Report';
import MyGoals from '../assets/svgs/MyGoals';
import Account from '../assets/svgs/Account';
import ActiveHome from '../assets/svgs/ActiveHome';
import ActiveExplore from '../assets/svgs/ActiveExplore';
import ActiveReport from '../assets/svgs/ActiveReport';
import ActiveMyGoals from '../assets/svgs/ActiveMyGoals';
import ActiveAccount from '../assets/svgs/ActiveAccount';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';

const TABS = [
  { id: 'Home', label: 'Home', Icon: HomeIcon, ActiveIcon: ActiveHome },
  { id: 'Explore', label: 'Explore', Icon: Explore, ActiveIcon: ActiveExplore },
  { id: 'Report', label: 'Report', Icon: Report, ActiveIcon: ActiveReport },
  { id: 'My Goals', label: 'My Goals', Icon: MyGoals, ActiveIcon: ActiveMyGoals },
  { id: 'Account', label: 'Account', Icon: Account, ActiveIcon: ActiveAccount },
];

const ACTIVE_ORANGE = lightColors.textButtonOrange;
const INACTIVE_GRAY = palette.gray500;

const ICON_SIZE = 24;

const BottomNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = isActive ? tab.ActiveIcon : tab.Icon;
          const labelColor = isActive ? ACTIVE_ORANGE : INACTIVE_GRAY;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
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
    backgroundColor: lightColors.background,
    borderTopWidth: 1,
    borderTopColor: palette.gray200,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: lightColors.background,
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

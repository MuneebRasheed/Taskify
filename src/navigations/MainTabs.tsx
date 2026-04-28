import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ReportScreen from '../screens/ReportScreen';
import MyGoalsScreen from '../screens/MyGoalsScreen';
import AccountScreen from '../screens/AccountScreen';

import HomeIcon from '../assets/svgs/HomeIcon';
import Explore from '../assets/svgs/Explore';
import Report from '../assets/svgs/Report';
import MyGoals from '../assets/svgs/MyGoals';
import Account from '../assets/svgs/Account';
import { useTranslation } from '../i18n';
import ActiveHomeIcon from '../assets/svgs/ActiveHomeIcon';
import ActiveExploreIcon from '../assets/svgs/ActiveExploreIcon';
import ActiveReportIcon from '../assets/svgs/ActiveReportIcon';
import ActiveMyGoalsIcon from '../assets/svgs/ActiveMyGoalsIcone';
import ActiveAccountIcon from '../assets/svgs/ActiveAccountIcon';
import { lightColors } from '../../utils/colors';

export type MainTabsParamList = {
  Home: undefined;
  Explore: undefined;
  Report: undefined;
  'My Goals': { 
    initialFilter?: 'ongoing' | 'achieved';
    showToast?: boolean;
    toastMessage?: string;
    toastAction?: 'delete' | 'achieve';
    deletedGoalId?: string;
    deletedGoalData?: any; // Full goal data for undo
    deletedGoalCompletions?: any; // Item completions for undo
  };
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICON_SIZE = 24;

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      id="MainTabs"
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightColors.background,
        tabBarInactiveTintColor: lightColors.placeholderText,
        tabBarStyle: {
          backgroundColor: lightColors.secondaryBackground,
          borderTopColor: lightColors.border,
          paddingTop: 18,
          paddingBottom: 38,
          paddingHorizontal: 8,
          marginBottom: 6,
          // height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? ActiveHomeIcon : HomeIcon;
            return focused ? (
              <Icon width={ICON_SIZE} height={ICON_SIZE} />
            ) : (
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={lightColors.placeholderText} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? ActiveExploreIcon : Explore;
            return focused ? (
              <Icon width={ICON_SIZE} height={ICON_SIZE} />
            ) : (
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={lightColors.placeholderText} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? ActiveReportIcon : Report;
            return focused ? (
              <Icon width={ICON_SIZE} height={ICON_SIZE} />
            ) : (
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={lightColors.placeholderText} />
            );
          },
        }}
      />
      <Tab.Screen
        name="My Goals"
        component={MyGoalsScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? ActiveMyGoalsIcon : MyGoals;
            return focused ? (
              <Icon width={ICON_SIZE} height={ICON_SIZE} />
            ) : (
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={lightColors.placeholderText} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: t('account'),
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? ActiveAccountIcon : Account;
            return focused ? (
              <Icon width={ICON_SIZE} height={ICON_SIZE} />
            ) : (
              <Icon width={ICON_SIZE} height={ICON_SIZE} color={lightColors.placeholderText} />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;

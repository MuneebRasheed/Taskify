import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import ThemeTest from '../screens/themeTest';
import Onboarding from '../screens/Onboarding';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import MainTabs, { type MainTabsParamList } from './MainTabs';
import AiGenetratingScreen from '../screens/AiGenetratingScreen';
import LanguageTestScreen from '../screens/LanguageTestScreen';
import AiMade from '../screens/AiMade';
import AddTaskScreen from '../screens/AddTaskScreen';
import GoalPlanner from '../screens/GoalPlanner';
import SelectCoverImageScreen from '../screens/SelectCoverImageScreen';
import PreMadeGoalsScreen from '../screens/PreMadeGoalsScreen';
import PreMadeGoalDetailScreen from '../screens/PreMadeGoalDetailScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import GoalAchievedScreen from '../screens/GoalAchievedScreen';
import FinalScreen from '../screens/FinalScreen';
import ExploreSearchScreen from '../screens/ExploreSearchScreen';
import MyGoalsScreen from '../screens/MyGoalsScreen';
import { GoalsProvider } from '../context/GoalsContext';
import UpgradePlanScreen from '../screens/UpgradePlanScreen';

import type { TrackerCardItem } from '../components/TrackerCard';
import AccountSecurityScreen from '../screens/AccountSecurityScreen';
import DataAnalyticsScreen from '../screens/DataAnalyticsScreen';
import AppAppearanceScreen from '../screens/AppAppearanceScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import FAQScreen from '../screens/FAQScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

/** Root stack route names and params. Use this type for useNavigation<> in screens. */
export type RootStackParamList = {
  SplashScreen: undefined;
  ThemeTest: undefined;
  LanguageTestScreen: undefined;
  Onboarding: undefined;
  WelcomeScreen: undefined;
  SignUpScreen: undefined;
  SignInScreen: undefined;
  MainTabs: undefined | { screen: keyof MainTabsParamList };
  AiGenetratingScreen: undefined;
  AiMade: {
    source?: 'selfMade';
    prompt?: string;
    selectedCoverIndex?: number;
    addedHabit?: TrackerCardItem;
    addedTask?: TrackerCardItem;
    updatedHabit?: { index: number; item: TrackerCardItem };
    updatedTask?: { index: number; item: TrackerCardItem };
  };
  AddTaskScreen: {
    mode: 'habit' | 'task';
    source?: 'selfMade';
    prompt?: string;
    editHabitIndex?: number;
    editTaskIndex?: number;
    initialItem?: TrackerCardItem;
  };
  GoalPlanner: {
    goalTitle?: string;
    selectedCoverIndex?: number;
    fromSelfMade?: boolean;
    initialHabits?: TrackerCardItem[];
    initialTasks?: TrackerCardItem[];
    initialNote?: string;
    initialCategory?: string;
    initialDueDate?: number | null;
    initialReminderDate?: number | null;
    initialReminderTime?: { hours: number; minutes: number; am: boolean } | null;
  };
  FinalScreen: {
    goalTitle: string;
    coverIndex: number;
    category: string | null;
    dueDate: number | null;
    reminderDate: number | null;
    reminderTime: { hours: number; minutes: number; am: boolean } | null;
    habits: TrackerCardItem[];
    tasks: TrackerCardItem[];
    note: string;
    fromSelfMade: boolean;
  };
  SelectCoverImage: { selectedIndex?: number; returnToScreen?: 'AiMade'; prompt?: string };
  PreMadeGoals: undefined;
  HabitDetailScreen: { goalId: string; itemId: string };
  TaskDetailScreen: { goalId: string; itemId: string };
  GoalAchievedScreen: undefined;
  PreMadeGoalDetail: {
    goalId?: string;
    myGoalId?: string;
    selfMadePayload?: {
      title: string;
      coverIndex: number;
      dueDate: number | null;
      note: string;
      habits: { title: string; reminderTime?: string }[];
      tasks: { title: string; reminderTime?: string }[];
    };
  };
  ExploreSearch: undefined;
  MyGoalsScreen: undefined;
  UpgradePlanScreen: undefined;
  AccountSecurityScreen: undefined;
  DataAnalyticsScreen: undefined;
  AppAppearanceScreen: undefined;
  HelpSupportScreen: undefined;
  FAQScreen: undefined;
  ContactSupportScreen: undefined;
  PrivacyPolicyScreen: undefined;
  TermsOfServiceScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigation() {
  return (
    <GoalsProvider>
    <Stack.Navigator
      id="RootStack"
      screenOptions={{
        headerShown: false,
      }}
      // initialRouteName="MainTabs"
    >
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThemeTest"
        component={ThemeTest}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LanguageTestScreen"
        component={LanguageTestScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AiGenetratingScreen"
        component={AiGenetratingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AiMade"
        component={AiMade}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTaskScreen"
        component={AddTaskScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GoalPlanner"
        component={GoalPlanner}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectCoverImage"
        component={SelectCoverImageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PreMadeGoals"
        component={PreMadeGoalsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PreMadeGoalDetail"
        component={PreMadeGoalDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HabitDetailScreen"
        component={HabitDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TaskDetailScreen"
        component={TaskDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GoalAchievedScreen"
        component={GoalAchievedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FinalScreen"
        component={FinalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExploreSearch"
        component={ExploreSearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyGoalsScreen"
        component={MyGoalsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpgradePlanScreen"
        component={UpgradePlanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountSecurityScreen"
        component={AccountSecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DataAnalyticsScreen"
        component={DataAnalyticsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppAppearanceScreen"
        component={AppAppearanceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpSupportScreen"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FAQScreen"
        component={FAQScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSupportScreen"
        component={ContactSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfServiceScreen"
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    </GoalsProvider>
  );
}


export default RootNavigation;
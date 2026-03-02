import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import ThemeTest from '../screens/themeTest';
import Onboarding from '../screens/Onboarding';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import AiGenetratingScreen from '../screens/AiGenetratingScreen';
import LanguageTestScreen from '../screens/LanguageTestScreen';
import AiMade from '../screens/AiMade';
import AddTaskScreen from '../screens/AddTaskScreen';
import GoalPlanner from '../screens/GoalPlanner';
import SelectCoverImageScreen from '../screens/SelectCoverImageScreen';
import type { TrackerCardItem } from '../components/TrackerCard';

/** Root stack route names and params. Use this type for useNavigation<> in screens. */
export type RootStackParamList = {
  SplashScreen: undefined;
  ThemeTest: undefined;
  LanguageTestScreen: undefined;
  Onboarding: undefined;
  WelcomeScreen: undefined;
  SignUpScreen: undefined;
  SignInScreen: undefined;
  HomeScreen: undefined;
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
  GoalPlanner: { goalTitle?: string; selectedCoverIndex?: number; fromSelfMade?: boolean };
  SelectCoverImage: { selectedIndex?: number; returnToScreen?: 'AiMade'; prompt?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigation() {
  return (
    <Stack.Navigator
      id="RootStack"
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="SplashScreen"
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
        name="HomeScreen"
        component={HomeScreen}
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
    </Stack.Navigator>
  );
}


export default RootNavigation;
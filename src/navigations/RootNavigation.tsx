import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import ThemeTest from '../screens/themeTest';
import Onboarding from '../screens/Onboarding';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import AiGoalsScreen from '../screens/AiGoalsScreen';
import LanguageTestScreen from '../screens/LanguageTestScreen';

/** Root stack route names and params. Use this type for useNavigation<> in screens. */
export type RootStackParamList = {
  SplashScreen: undefined;
  ThemeTest: undefined;
  LanguageTestScreen: undefined;
  Onboarding:undefined;
  WelcomeScreen:undefined;
  SignUpScreen:undefined;
  SignInScreen:undefined;
  HomeScreen:undefined;
  AiGoalsScreen:undefined;
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
        name="AiGoalsScreen"
        component={AiGoalsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}


export default RootNavigation;
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/RootNavigation';
import Button from '../components/Button';
import { palette } from '../../utils/colors';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ThemeTest'>;

const ThemeTest = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme Test</Text>
      <Button
        title="Open Language Test (EN / AR RTL)"
        variant="outline"
        onPress={() => navigation.navigate('LanguageTestScreen')}
        backgroundColor={palette.white}
        borderColor={palette.gray300}
        borderWidth={1}
        borderRadius={24}
        textColor={palette.black}
      />
    </View>
  );
};

export default ThemeTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
  title: {
    fontSize: 20,
    marginBottom: 24,
    color: palette.black,
  },
});
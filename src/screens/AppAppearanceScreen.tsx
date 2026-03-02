import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lightColors } from '../../utils/colors';
import { useTranslation } from '../i18n';
import BackHeader from '../components/BackHeader';
import SettingsListItem from '../components/SettingsListItem';
import ThemeModal, { type ThemeOption } from '../components/ThemeModal';
import { RootStackParamList } from '../navigations/RootNavigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AppAppearanceScreen'>;

const themeLabels: Record<ThemeOption, string> = {
  system: 'themeSystemDefault',
  light: 'themeLight',
  dark: 'themeDark',
};

const AppAppearanceScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();

  const [theme, setTheme] = useState<ThemeOption>('light');
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [themeModalSelection, setThemeModalSelection] = useState<ThemeOption>(theme);

  const openThemeModal = () => {
    setThemeModalSelection(theme);
    setThemeModalVisible(true);
  };

  const confirmTheme = () => {
    setTheme(themeModalSelection);
    setThemeModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackHeader
        title={t('appAppearanceTitle')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <SettingsListItem
            label={t('theme')}
            value={t(themeLabels[theme])}
            onPress={openThemeModal}
            showArrow={true}
          />
          <SettingsListItem
            label={t('appLanguage')}
            value={t('englishUS')}
            onPress={() => {}}
            showArrow={true}
          />
        </View>
      </ScrollView>

      <ThemeModal
        visible={themeModalVisible}
        selectedTheme={themeModalSelection}
        onSelect={setThemeModalSelection}
        onCancel={() => setThemeModalVisible(false)}
        onConfirm={confirmTheme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.BtnBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default AppAppearanceScreen;

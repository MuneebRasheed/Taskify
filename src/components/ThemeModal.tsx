import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import { useTranslation } from '../i18n';

export type ThemeOption = 'system' | 'light' | 'dark';

interface ThemeModalProps {
  visible: boolean;
  selectedTheme: ThemeOption;
  onSelect: (theme: ThemeOption) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  selectedTheme,
  onSelect,
  onCancel,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const options: { value: ThemeOption; labelKey: string }[] = [
    { value: 'system', labelKey: 'themeSystemDefault' },
    { value: 'light', labelKey: 'themeLight' },
    { value: 'dark', labelKey: 'themeDark' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>{t('chooseTheme')}</Text>
            <View style={styles.list}>
              {options.map(({ value, labelKey }) => {
                const isSelected = selectedTheme === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={styles.row}
                    onPress={() => onSelect(value)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.rowText}>{t(labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.buttons}>
              <Button
                title={t('cancel')}
                variant="outline"
                onPress={onCancel}
                style={styles.cancelBtn}
                borderWidth={0}
                backgroundColor={lightColors.skipbg}
                textColor={lightColors.background}
              />
              <Button
                title={t('ok')}
                variant="primary"
                onPress={onConfirm}
                style={styles.okBtn}
                backgroundColor={lightColors.accent}
                textColor={palette.white}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.placeholderText,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 18,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
   
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: lightColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: lightColors.background,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: lightColors.background,
  },
  rowText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 100,
  },
  okBtn: {
    flex: 1,
    borderRadius: 100,
  },
});

export default ThemeModal;

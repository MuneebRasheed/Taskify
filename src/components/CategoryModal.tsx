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
import CheckIcon from '../assets/svgs/CheckIcon';
import { useTranslation } from '../i18n';
import Textt from './Textt';

export const GOAL_CATEGORIES = [
  'General',
  'Career',
  'Health',
  'Travel',
  'Relationship',
  'Learning',
  'Wealth',
  'Hobby',
  'Other',
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: GoalCategory | null;
  onSelect: (category: GoalCategory) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface CategoryPickerContentProps {
  selectedCategory: GoalCategory | null;
  onSelect: (category: GoalCategory) => void;
  onCancel: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

export const CategoryPickerContent: React.FC<CategoryPickerContentProps> = ({
  selectedCategory,
  onSelect,
  onCancel,
  onConfirm,
  t,
}) => (
  <>
    <Textt i18nKey="category" style={styles.title} />
    <View style={styles.divider} />
    <View style={styles.list}>
      {GOAL_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={styles.row}
            onPress={() => onSelect(cat)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowText}>{cat}</Text>
            {isSelected && (
              <View style={styles.checkWrap}>
                <CheckIcon width={22} height={22} fill={lightColors.background}/>
              </View>
            )}
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
  </>
);

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  selectedCategory,
  onSelect,
  onCancel,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
              {
                paddingBottom: insets.bottom,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.handle} />
            <CategoryPickerContent
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              onCancel={onCancel}
              onConfirm={onConfirm}
              t={t}
            />
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: lightColors.blurBackground,
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
    fontSize: 24,
    color: lightColors.text,
    textAlign: 'center',
    // marginBottom: 12,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: lightColors.border,
    // marginBottom: 8,
  },
  list: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  rowText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 20,
    color: lightColors.text,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: lightColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
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

export default CategoryModal;

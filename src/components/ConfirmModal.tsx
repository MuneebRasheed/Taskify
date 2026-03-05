import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  /** Optional second line (e.g. "This action cannot be undone.") */
  messageLine2?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Title color - default accent (purple). Use lightColors.text for black. */
  titleColor?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  messageLine2,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  titleColor = lightColors.accent,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <TouchableWithoutFeedback>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.grabHandle} />
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {messageLine2 ? (
              <Text style={styles.messageLine2}>{messageLine2}</Text>
            ) : null}
            <View style={styles.buttons}>
              <Button
                title={cancelLabel}
                onPress={onCancel}
                variant="outline"
                backgroundColor={lightColors.skipbg}
                textColor={lightColors.background}
                borderWidth={0}
                paddingVertical={18}
                minHeight={46}
                style={styles.cancelBtn}
              />
              <Button
                title={confirmLabel}
                onPress={onConfirm}
                variant="primary"
                backgroundColor={lightColors.accent}
                textColor={lightColors.secondaryBackground}
                paddingVertical={14}
                minHeight={46}
                style={styles.confirmBtn}
              />
            </View>
          </Pressable>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: lightColors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 24,
  },
  message: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 20,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 24,
    // lineHeight: 22,
  },
  messageLine2: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 20,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 24,
    // lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});

export default ConfirmModal;

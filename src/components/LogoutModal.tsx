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
import { lightColors, palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import { useTranslation } from '../i18n';

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
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
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.title}>{t('logout')}</Text>
            <View style={styles.divider} /> 
            <Text style={styles.message}>{t('logoutConfirmMessage')}</Text>
            <View style={styles.divider} /> 
            <View style={styles.buttons}>
              <Button
                title={t('cancel')}
                variant="outline"
                onPress={onCancel}
                style={styles.cancelBtn}
                borderWidth={0}
                backgroundColor={lightColors.skipbg}
                textColor={lightColors.text}
              />
              <Button
                title={t('yesLogout')}
                variant="primary"
                onPress={onConfirm}
                style={styles.confirmBtn}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.secondaryBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.accent,
    textAlign: 'center',
    marginBottom: 10, 
    
  },
  divider: {
    height: 1,
    backgroundColor: lightColors.border,
    marginVertical: 12,
    width: '100%',
  },
  message: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    
   
    
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 100,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 100,
  },
});

export default LogoutModal;

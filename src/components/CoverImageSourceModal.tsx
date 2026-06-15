import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import ImageIcon from '../assets/svgs/ImageIcon';
import { useTranslation } from '../i18n';

interface CoverImageSourceModalProps {
  visible: boolean;
  onSelectGallery: () => void;
  onSelectStatic: () => void;
  onClose: () => void;
}

const CoverImageSourceModal: React.FC<CoverImageSourceModalProps> = ({
  visible,
  onSelectGallery,
  onSelectStatic,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Cover Image Source</Text>
          
          <TouchableOpacity
            style={styles.option}
            onPress={onSelectGallery}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <ImageIcon width={24} height={24} />
            </View>
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={onSelectStatic}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <ImageIcon width={24} height={24} />
            </View>
            <Text style={styles.optionText}>Choose from Static Images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CoverImageSourceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: lightColors.secondaryBackground,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: fontFamilies.urbanistBold,
    fontSize: 20,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.text,
    flex: 1,
  },
  cancelButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fontFamilies.urbanistSemiBold,
    fontSize: 16,
    color: lightColors.subText,
  },
});

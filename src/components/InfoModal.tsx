import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightColors } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Button from './Button';
import Textt from './Textt';

export interface InfoModalProps {
  visible: boolean;
  title: string;
  /** Array of info tip items with optional i18n keys */
  tips: Array<{
    text?: string;
    i18nKey?: string;
  }>;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  title,
  tips,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <TouchableWithoutFeedback>
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.grabHandle} />
            <Text style={styles.title}>{title}</Text>
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.bulletPoint} />
                  {tip.i18nKey ? (
                    <Textt i18nKey={tip.i18nKey} style={styles.tipText} />
                  ) : (
                    <Text style={styles.tipText}>{tip.text}</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Button
                title="Got it"
                onPress={onClose}
                variant="primary"
                backgroundColor={lightColors.accent}
                textColor={lightColors.secondaryBackground}
                paddingVertical={14}
                minHeight={46}
                style={styles.closeBtn}
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
    maxHeight: '80%',
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
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingBottom: 24,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightColors.accent,
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  tipText: {
    fontFamily: fontFamilies.urbanistMedium,
    fontSize: 16,
    color: lightColors.text,
    lineHeight: 24,
    flex: 1,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 16,
  },
  closeBtn: {
    width: '100%',
  },
});

export default InfoModal;

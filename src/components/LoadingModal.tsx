import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { palette } from '../../utils/colors';
import { fontFamilies } from '../theme/typography';
import Starts from '../assets/svgs/starts';

export interface LoadingModalProps {
  visible: boolean;
  text?: string;
}

export default function LoadingModal({ visible, text = 'Generating plan...' }: LoadingModalProps) {
  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Starts width={56} height={56} fill={palette.orange} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: palette.white,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 220,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fontFamilies.urbanist,
    color: palette.black,
  },
});

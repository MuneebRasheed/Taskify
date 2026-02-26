import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation } from '../i18n';

export interface TexttProps extends Omit<TextProps, 'children'> {
  /** Translation key (e.g. 'welcome', 'hello') */
  i18nKey: string;
  /** Optional interpolation options for t() */
  i18nOptions?: Record<string, unknown>;
}

const Textt: React.FC<TexttProps> = ({ i18nKey, i18nOptions, ...textProps }) => {
  const { t } = useTranslation();
  return <Text {...textProps}>{t(i18nKey, i18nOptions)}</Text>;
};

export default Textt;
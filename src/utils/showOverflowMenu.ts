import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type OverflowMenuItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type ShowOverflowMenuParams = {
  title?: string;
  items: OverflowMenuItem[];
  cancelLabel?: string;
};

export const showOverflowMenu = ({
  title,
  items,
  cancelLabel = 'Cancel',
}: ShowOverflowMenuParams) => {
  if (!items.length) return;

  if (Platform.OS === 'ios') {
    const options = [...items.map((item) => item.label), cancelLabel];
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = items.findIndex((item) => item.destructive);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex) return;
        const picked = items[buttonIndex];
        picked?.onPress?.();
      }
    );
    return;
  }

  Alert.alert(
    title ?? 'Options',
    undefined,
    [
      ...items.map((item) => ({
        text: item.label,
        style: item.destructive ? 'destructive' : ('default' as const),
        onPress: item.onPress,
      })),
      { text: cancelLabel, style: 'cancel' as const },
    ],
    { cancelable: true }
  );
};

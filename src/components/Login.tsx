import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "../../utils/colors";
import { fontFamilies } from "../theme/typography";

export interface InputFieldProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  /** Custom left icon (e.g. EmailIcon, PasswordIcon). When set, replaces the default Feather icon. */
  leftIcon?: React.ReactNode;
}

export default function InputField({
  value,
  onChangeText,
  label = "Email",
  placeholder,
  secureTextEntry = false,
  showPasswordToggle = false,
  keyboardType = "email-address",
  leftIcon,
  ...rest
}: InputFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry && showPasswordToggle;
  const secure = secureTextEntry && !visible;

  const leftIconName = secureTextEntry ? "lock" : "mail";
  const placeholderText =
    placeholder ??
    (secureTextEntry ? "••••••••" : "andrew.ainsley@yourdomain.com");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {leftIcon ? (
          <View style={styles.leftIcon}>{leftIcon}</View>
        ) : (
          <Feather
            name={leftIconName}
            size={20}
            color={palette.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholderText}
          placeholderTextColor={palette.gray500}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={secureTextEntry ? "default" : keyboardType}
          autoCapitalize={secureTextEntry ? "none" : undefined}
          {...rest}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather
              name={visible ? "eye-off" : "eye"}
              size={20}
              color={palette.gray500}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    marginBottom: 8,
    color: palette.black,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.gray100,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: "transparent",
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.urbanist,
    fontSize: 16,
    color: palette.black,
    paddingVertical: 16,
    paddingRight: 8,
  },
  eyeButton: {
    padding: 4,
  },
});

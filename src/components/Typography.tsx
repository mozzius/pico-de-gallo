import { useTheme } from "@react-navigation/native";
import { Text as BaseText, StyleSheet, TextProps } from "react-native";

export function Text({
  style,
  themed = true,
  ...props
}: TextProps & { themed?: boolean }) {
  const theme = useTheme();
  return (
    <BaseText
      style={
        themed ? StyleSheet.compose({ color: theme.colors.text }, style) : style
      }
      {...props}
    />
  );
}

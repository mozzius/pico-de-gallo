import { useTheme } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "#/lib/auth";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Button as RNButton, TextInput } from "react-native";
import { Button, HStack, List, Section, Text } from "swiftui-react-native";

export default function AuthScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { logIn } = useAuth();
  const theme = useTheme();

  const action = useMutation({
    mutationFn: async () => {
      if (!identifier || !password) {
        throw new Error("Please enter a username and password");
      }
      const { success } = await logIn(identifier, password);
      if (success) {
        return true;
      } else {
        throw new Error("Incorrect username or password");
      }
    },
    onSuccess: () => {
      router.dismiss();
    },
  });

  const headerRight = useCallback(
    () => <RNButton title="Done" disabled={action.isPending} onPress={() => router.dismiss()} />,
    [router, action.isPending],
  );

  return (
    <>
      <Stack.Screen options={{ headerRight }} />
      <List style={{ flex: 1 }}>
        <Section
          header="Bluesky username & password"
          footer={action.error ? action.error.message : undefined}
        >
          <TextInput
            defaultValue={identifier}
            onChangeText={setIdentifier}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            className="flex-1 text-lg leading-5"
            style={{ color: theme.colors.text }}
          />
          <TextInput
            defaultValue={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            className="flex-1 text-lg leading-5"
            style={{ color: theme.colors.text }}
          />
        </Section>
        <Button
          action={action.mutate}
          disabled={action.isPending || !identifier || !password}
        >
          <HStack alignment="center">
            <Text bold>Sign in</Text>
          </HStack>
        </Button>
      </List>
    </>
  );
}

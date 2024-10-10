import { useAuth } from "#/lib/auth";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Button,
  HStack,
  List,
  Section,
  SecureField,
  Text,
  TextField,
  useBinding,
} from "swiftui-react-native";

export default function AuthScreen() {
  const identifier = useBinding("");
  const password = useBinding("");
  const router = useRouter();
  const [error, setError] = useState(false);
  const { logIn } = useAuth();

  const headerRight = useCallback(
    () => <Button title="Done" bold action={router.dismiss} />,
    [router],
  );

  return (
    <>
      <Stack.Screen options={{ headerRight }} />
      <List>
        <Section
          header="Username & password"
          footer={
            error
              ? "Incorrect username or password. Please try again."
              : undefined
          }
        >
          <TextField
            text={identifier}
            placeholder="Username"
            textInputAutocapitalization="never"
            autocorrectionDisabled
            textContentType="username"
            textFieldStyle="roundedBorder"
            frame={{}}
          />
          <SecureField
            text={password}
            placeholder="App password"
            textContentType="password"
          />
        </Section>
        <Button
          action={async () => {
            setError(false);
            if (!identifier.value || !password.value) {
              return;
            }
            const { success } = await logIn(identifier.value, password.value);
            if (success) {
              router.dismiss();
            } else {
              setError(true);
            }
          }}
        >
          <HStack alignment="center">
            <Text bold>Sign in</Text>
          </HStack>
        </Button>
      </List>
    </>
  );
}

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "#/lib/useColorScheme";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";
import "#/global.css";
import * as SecureStore from "expo-secure-store";
import { Alert, Button } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null | undefined>();
  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: "https://pico.mozzius.dev/client-metadata.json",
      redirectUri: "picodegallo:///",
      scopes: ["atproto", "transition:generic"],
      usePKCE: true,
      responseType: ResponseType.Code,
      extraParams: {
        grant_types: "authorization_code,refresh_token",
        application_type: "native",
        token_endpoint_auth_method: "none",
        dpop_bound_access_tokens: "true",
      },
    },
    {
      authorizationEndpoint: "https://bsky.social/oauth/authorize",
    },
  );

  const headerLeft = useCallback(() => {
    return <Button title="Log in" onPress={() => promptAsync()} />;
  }, [promptAsync]);

  useEffect(() => {
    SecureStore.getItemAsync("token").then(
      (value) => setToken(value),
      () => setToken(null),
    );
  }, []);

  useEffect(() => {
    if (token !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [token]);

  useEffect(() => {
    if (!result) return;
    switch (result.type) {
      case "success": {
        console.log(result);
      }
      case "error": {
        console.error(result.error, result.params);
        Alert.alert("Failed to log in", result.error?.message);
      }
      default: {
        console.log(result);
      }
    }
  }, [result]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Pico de Gallo",
              headerTransparent: true,
              headerShadowVisible: true,
              headerBlurEffect: "prominent",
              headerStyle: { backgroundColor: "rgba(255,255,255,0.001)" },
              headerLeft,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

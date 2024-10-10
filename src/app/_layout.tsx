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
import { useCallback, useEffect } from "react";
import "react-native-reanimated";
import "#/global.css";
import { Button } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [request, result, prompt] = useAuthRequest({
    clientId: "https://pico.mozzius.dev/client-metadata.json",
    redirectUri: "picodegallo:///",
    scopes: ["atproto", "transition:generic"],
    usePKCE: true,
    responseType: ResponseType.Code,
  }, null)

  const headerLeft = useCallback(() => {
    return <Button title="Log in" onPress={() => prompt()} />
  }, [])

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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

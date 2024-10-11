import "react-native-reanimated";
import "#/lib/polyfill";
import "#/global.css";
import { Agent, AtpSessionData, CredentialSession } from "@atproto/api";
import NetInfo from "@react-native-community/netinfo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Avatar } from "#/components/Avatar";
import { AgentProvider, defaultAgent } from "#/lib/agent";
import { AuthProvider } from "#/lib/auth";
import { getPDSfromDID } from "#/lib/pds";
import { useColorScheme } from "#/lib/useColorScheme";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { AppState, Button, Platform, PlatformColor } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<
    { pds: string; data: AtpSessionData } | null | undefined
  >();
  const [agent, setAgent] = useState<Agent | undefined>();
  const router = useRouter();

  const headerLeft = useCallback(() => {
    return session ? (
      <Avatar />
    ) : (
      <Button title="Log in" onPress={() => router.push("/auth")} />
    );
  }, [router, session]);

  useEffect(() => {
    SecureStore.getItemAsync("session").then(
      (value) => setSession(value ? JSON.parse(value) : null),
      () => setSession(null),
    );
  }, []);

  useEffect(() => {
    if (session !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [session]);

  useEffect(() => {
    if (!agent && session) {
      const handler = new CredentialSession(new URL(session.pds));
      const agent = new Agent(handler);
      handler
        .resumeSession(session.data)
        .then(() => setAgent(agent))
        .catch(() => {
          console.error("Could not resume session, deleting");
          SecureStore.deleteItemAsync("session");
        });
      setAgent(agent);
    }
  }, [agent, session]);

  const logIn = useCallback(async (identifier: string, password: string) => {
    try {
      const pdsUrl =
        (await defaultAgent.com.atproto.identity
          .resolveHandle({
            handle: identifier,
          })
          .then((res) => getPDSfromDID(res.data.did))
          .catch(() => undefined)) ?? "https://bsky.social";

      const credentialSession = new CredentialSession(new URL(pdsUrl));
      const agent = new Agent(credentialSession);

      const loginRes = await credentialSession.login({ identifier, password });

      const session = {
        pds: pdsUrl,
        data: {
          active: true,
          ...loginRes.data,
        },
      };

      await SecureStore.setItemAsync("session", JSON.stringify(session)).catch(
        console.error,
      );

      setSession(session);
      setAgent(agent);
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  }, []);

  const logOut = useCallback(() => {
    setSession(null);
    setAgent(undefined);
    SecureStore.deleteItemAsync("session");
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) =>
      focusManager.setFocused(status === "active"),
    );
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider
          user={session ? { did: session.data.did } : null}
          logIn={logIn}
          logOut={logOut}
        >
          <AgentProvider agent={agent}>
            <Stack
              screenOptions={{
                headerTransparent: true,
                headerShadowVisible: true,
                headerLargeTitleShadowVisible: true,
                headerBlurEffect: "prominent",
                headerStyle: { backgroundColor: "rgba(255,255,255,0.001)" },
                // @ts-expect-error PlatformColor bleh
                headerLargeStyle: {
                  backgroundColor: PlatformColor(
                    "systemGroupedBackgroundColor",
                  ),
                },
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  title: "Pico de Gallo",
                  headerLeft,
                }}
              />
              <Stack.Screen
                name="auth"
                options={{
                  title: "Log in",
                  presentation: "formSheet",
                  headerLargeTitle: true,
                  // statusBarStyle: "light",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AgentProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

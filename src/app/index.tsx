import { Composer } from "#/components/Composer";
import { Feed } from "#/components/Feed";
import { Text } from "#/components/Typography";
import { useAuth } from "#/lib/auth";
import { type ErrorBoundaryProps } from "expo-router";
import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [showComposer, setShowComposer] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowComposer(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View
      className="flex-1 bg-white dark:bg-black"
      style={{ paddingBottom: !!user ? 0 : insets.bottom }}
    >
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        }
      >
        <Feed />
        {showComposer && !!user && <Composer />}
      </Suspense>
    </View>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-white dark:bg-black justify-center gap-2 p-4">
      <Text className="text-2xl text-center">
        {error.message}
      </Text>
      <Button onPress={retry} title="Try again?" />
    </View>
  );
}

import { Text } from "#/components/Typography";
import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text>This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 mx-4">
          <Text className="color-blue-500">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

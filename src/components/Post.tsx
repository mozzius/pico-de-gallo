import { Text } from "#/components/Typography";
import { type PostRecord } from "#/lib/types";
import { View } from "react-native";

export function Container({ children }: { children: React.ReactNode }) {
  return <View className="px-4 py-1 gap-1">{children}</View>;
}

export function Author({
  nickname,
  handle,
}: {
  nickname?: string;
  handle: string;
}) {
  return (
    <View className="flex-row items-center gap-1 justify-left flex-wrap mt-1">
      {nickname && <Text className="text-lg">{nickname}</Text>}
      <Text className="text-gray-600 dark:text-gray-400 text-lg" themed={false}>{handle}</Text>
    </View>
  );
}

export function Content({ text }: { text: string }) {
  return <Text className="text-lg">{text}</Text>;
}

export function Full({ post }: { post: PostRecord }) {
  return (
    <Container>
      <Author handle={post.handle} nickname={post.nickname} />
      <Content text={post.post} />
    </Container>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useAgent } from "#/lib/agent";
import { useAuth } from "#/lib/auth";
import { Image, View } from "react-native";

export function Avatar() {
  const agent = useAgent();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["avatar", user?.did],
    queryFn: async () => {
      if (!user) return;
      const res = await agent.app.bsky.actor.getProfile({ actor: user.did });
      return res.data.avatar;
    },
  });

  if (data) {
    return <Image className="rounded-full w-8 h-8" source={{ uri: data }} />;
  } else {
    return <View className="rounded-full w-8 h-8 bg-gray-500" />;
  }
}

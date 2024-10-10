import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useAgent } from "#/lib/agent";
import { useAuth } from "#/lib/auth";
import { useRef } from "react";
import {
  ActionSheetIOS,
  findNodeHandle,
  Image,
  TouchableOpacity,
  View,
} from "react-native";

export function Avatar() {
  const agent = useAgent();
  const { user, logOut } = useAuth();
  const { dark, colors } = useTheme();
  const ref = useRef<View>(null!);

  const { data } = useQuery({
    queryKey: ["avatar", user?.did],
    queryFn: async () => {
      if (!user) return;
      const res = await agent.app.bsky.actor.getProfile({ actor: user.did });
      return res.data.avatar;
    },
  });

  const handlePress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Log out", "Cancel"],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1,
        userInterfaceStyle: dark ? "dark" : "light",
        anchor: findNodeHandle(ref.current) || undefined,
        tintColor: colors.primary,
      },
      (index) => {
        if (index === 0) logOut();
      },
    );
  };

  if (data) {
    return (
      <TouchableOpacity onPress={handlePress} ref={ref}>
        <Image className="rounded-full w-8 h-8" source={{ uri: data }} />
      </TouchableOpacity>
    );
  } else {
    return <View className="rounded-full w-8 h-8 bg-gray-500" />;
  }
}

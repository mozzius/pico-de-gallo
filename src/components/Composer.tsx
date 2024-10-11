import { RichText } from "@atproto/api";
import { TID } from "@atproto/common-web";
import Icon from "@expo/vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useAgent } from "#/lib/agent";
import { useAuth } from "#/lib/auth";
import { CHARLIMIT } from "#/lib/constants";
import { SocialPskyFeedPost } from "#/lib/lexicon";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  InputAccessoryView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { countGrapheme } from "unicode-segmenter";

export function Composer() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const ref = useRef<TextInput>(null!);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const agent = useAgent();
  const { user } = useAuth();

  const len = useMemo(() => countGrapheme(text), [text]);

  const handleSubmit = useCallback(async () => {
    if (len === 0 || len > CHARLIMIT) return;
    if (!user) throw new Error("User not logged in");
    if (text) {
      setText("");
      ref.current.clear();
      const rt = new RichText({ text });
      // await rt.detectFacets(agent);
      await agent.com.atproto.repo.createRecord({
        repo: user.did,
        collection: "social.psky.feed.post",
        rkey: TID.nextStr(),
        record: {
          $type: "social.psky.feed.post",
          text: rt.text,
        } satisfies SocialPskyFeedPost.Record,
      });
    }
  }, [text, len, queryClient]);

  return (
    <InputAccessoryView>
      <View
        className="bg-white dark:bg-black relative"
        style={{
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        }}
      >
        <View className="flex-row gap-2 px-4 py-2 flex-1">
          <TextInput
            ref={ref}
            defaultValue={text}
            onChangeText={setText}
            className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-3xl
           px-4 py-2 text-lgh leading-5"
            style={{ color: theme.colors.text }}
            placeholderClassName="text-gray-500"
            onSubmitEditing={handleSubmit}
            placeholder="Something to say?"
            multiline
          />
          <Pressable
            onPress={handleSubmit}
            className="rounded-full w-9 h-9 items-center justify-center"
            disabled={len > CHARLIMIT}
            style={{
              backgroundColor:
                len > CHARLIMIT
                  ? theme.colors.background
                  : theme.colors.primary,
            }}
          >
            <Icon name="arrow-right" size={18} color="white" />
          </Pressable>
        </View>
        {/* fill in area outside safe area */}
        <View
          className="absolute top-full left-0 right-0 bg-white dark:bg-black"
          style={{ height: insets.bottom }}
        />
      </View>
    </InputAccessoryView>
  );
}

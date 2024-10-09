import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { usePicoPosts } from "#/lib/api";
import { PostRecord } from "#/lib/types";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  InputAccessoryView,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardState,
  runOnJS,
  scrollTo,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        }
      >
        <Feed />
      </Suspense>
      <Composer />
    </View>
  );
}

function Feed() {
  const { posts, fetchNextPage, hasNextPage } = usePicoPosts();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const aRef = useAnimatedRef<FlatList>();

  const postPairs = useMemo(() => {
    const pairs: { post: PostRecord; prev?: PostRecord }[] = [];
    for (const [index, post] of posts.entries()) {
      const prev = posts[index + 1];
      pairs.push({ post, prev });
    }
    return pairs;
  }, [posts]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<{ post: PostRecord; prev?: PostRecord }>) => {
      const isPrevSameAuthor = item.prev && item.prev.did === item.post.did;
      return (
        <View className="px-4 py-1 gap-1">
          {!isPrevSameAuthor && (
            <Text className="text-gray-600">
              {item.post.nickname && `${item.post.nickname} `}@
              {item.post.handle}
            </Text>
          )}
          <Text>{item.post.post}</Text>
        </View>
      );
    },
    [],
  );

  const keyboard = useAnimatedKeyboard();

  useAnimatedReaction(
    () => keyboard.height.value,
    (height, prevHeight) => {
      const isMounting = keyboard.state.value === KeyboardState.UNKNOWN
      const isOpening = keyboard.state.value === KeyboardState.OPENING
      if (isMounting || (isOpening && (!prevHeight || height > prevHeight))) {
        scrollTo(aRef, 0,  -height, true)
      }
    },
  );

  return (
    <FlatList
      ref={aRef}
      inverted
      data={postPairs}
      renderItem={renderItem}
      keyExtractor={(item) => item.post.rkey}
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      keyboardDismissMode="interactive"
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets
      automaticallyAdjustContentInsets={false}
      // contentInset={{ top: headerHeight }}
    />
  );
}

function Composer() {
  const [text, setText] = useState("");
  const ref = useRef<TextInput>(null!);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleSubmit = useCallback(() => {
    if (text) {
      setText("");
      ref.current.clear();
    }
  }, [text]);

  return (
    <InputAccessoryView>
      <View
        className="bg-white dark:bg-black px-4 relative"
        style={{
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        }}
      >
        <TextInput
          ref={ref}
          defaultValue={text}
          onChangeText={setText}
          className="bg-gray-200 my-2 dark:bg-gray-700 rounded-full px-4 py-2 text-base leading-5"
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          multiline
        />
        {/* fill in area outside safe area */}
        <View
          className="absolute top-full left-0 right-0 bg-white dark:bg-black"
          style={{ height: insets.bottom }}
        />
      </View>
    </InputAccessoryView>
  );
}

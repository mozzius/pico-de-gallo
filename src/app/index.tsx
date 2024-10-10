import { Composer } from "#/components/Composer";
import { usePicoPosts } from "#/lib/api";
import { useAuth } from "#/lib/auth";
import { PostRecord } from "#/lib/types";
import { type ErrorBoundaryProps } from "expo-router";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  ListRenderItemInfo,
  Text,
  View,
} from "react-native";
import {
  KeyboardState,
  scrollTo,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedRef,
} from "react-native-reanimated";
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

function Feed() {
  const { posts, fetchNextPage, hasNextPage } = usePicoPosts();
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
      const isMounting = keyboard.state.value === KeyboardState.UNKNOWN;
      const isOpening = keyboard.state.value === KeyboardState.OPENING;
      if (isMounting || (isOpening && (!prevHeight || height > prevHeight))) {
        scrollTo(aRef, 0, -height, true);
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

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-white dark:bg-black justify-center gap-2 p-4">
      <Text className="text-2xl text-center text-black dark:text-white">
        {error.message}
      </Text>
      <Button onPress={retry} title="Try again?" />
    </View>
  );
}

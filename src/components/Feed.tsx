import { useHeaderHeight } from "@react-navigation/elements";
import * as Post from "#/components/Post";
import { usePicoPosts } from "#/lib/api";
import { PostRecord } from "#/lib/types";
import { useCallback, useMemo, useState } from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import Animated, {
  KeyboardState,
  runOnUI,
  scrollTo,
  useAnimatedKeyboard,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

export function Feed() {
  const { posts, fetchNextPage, hasNextPage } = usePicoPosts();
  const aRef = useAnimatedRef<FlatList>();
  const [prevLatestPost, setPrevLatestPost] = useState<string | null>(null);
  const headerHeight = useHeaderHeight();

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
        <Post.Container>
          {!isPrevSameAuthor && (
            <Post.Author
              nickname={item.post.nickname}
              handle={item.post.handle}
            />
          )}
          <Post.Content text={item.post.post} />
        </Post.Container>
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
        scrollTo(aRef, 0, -height, false);
      }
    },
  );

  const scrollPos = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPos.value = event.contentOffset.y;
    },
  });

  const maybeScrollToBottom = () => {
    "worklet";
    if (scrollPos.value - keyboard.height.value < 30) {
      scrollTo(aRef, 0, -keyboard.height.value, true);
    }
  };

  const latestPost = posts[0]?.rkey ?? null;

  if (latestPost !== prevLatestPost) {
    setPrevLatestPost(latestPost);
    if (prevLatestPost !== null) {
      runOnUI(maybeScrollToBottom)();
    }
  }

  const animatedProps = useAnimatedProps(() => {
    return {
      scrollIndicatorInsets: {
        top: keyboard.height.value,
        bottom: headerHeight,
      },
    };
  });

  return (
    <Animated.FlatList
      ref={aRef}
      // onScroll={onScroll}
      inverted
      data={postPairs.slice(1)}
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
      automaticallyAdjustsScrollIndicatorInsets={false}
      animatedProps={animatedProps}
      automaticallyAdjustContentInsets={false}
      ListHeaderComponent={<View className="h-2" />}
      // contentInset={{ top: headerHeight }}
    />
  );
}

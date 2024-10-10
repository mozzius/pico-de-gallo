import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BSKY_PUB_API_URL, MAXPOSTS, SERVER_URL } from "./constants";
import { PostRecord } from "./types";

export function usePicoPosts() {
  const { data, ...rest } = useSuspenseInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        limit: String(MAXPOSTS),
      });
      if (pageParam) searchParams.set("cursor", pageParam);
      const response = await fetch(
        `${SERVER_URL}/posts?${searchParams}`,
      );
      return (await response.json()) as { cursor: number; posts: PostRecord[] };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => String(page.cursor),
    refetchInterval: 5000
  });

  return {
    posts: useMemo(() => {
      return data.pages.toReversed().flatMap((page) => page.posts)
    }, [data]),
    ...rest,
  };
}

export async function resolveDid(did: string) {
  const res = await fetch(
    did.startsWith("did:web")
      ? `https://${did.split(":")[2]}/.well-known/did.json`
      : "https://plc.directory/" + did,
  );

  return res.json().then((doc) => {
    for (const alias of doc.alsoKnownAs) {
      if (alias.includes("at://")) {
        return alias.split("//")[1];
      }
    }
  });
}

export async function resolveHandle(handle: string) {
  const res = await fetch(
    `https://${BSKY_PUB_API_URL}/xrpc/com.atproto.identity.resolveHandle?handle=` +
      handle,
  );

  return res.json().then((json) => json.did);
}

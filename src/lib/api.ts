import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MAXPOSTS, SERVER_URL } from "./constants";
import { PostRecord } from "./types";

export function usePicoPosts() {
  const { data, ...rest } = useSuspenseInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        limit: String(MAXPOSTS),
      });
      if (pageParam) searchParams.set("cursor", pageParam);
      const response = await fetch(`${SERVER_URL}/posts?${searchParams}`);
      return (await response.json()) as { cursor: number; posts: PostRecord[] };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => String(page.cursor),
    refetchInterval: 3000,
  });

  return {
    posts: useMemo(() => {
      return data.pages.toReversed().flatMap((page) => page.posts);
    }, [data]),
    ...rest,
  };
}

export async function resolveDidDoc(did: string): Promise<DIDDocument> {
  const res = await fetch(
    did.startsWith("did:web")
      ? `https://${did.slice("did:web:".length)}/.well-known/did.json`
      : "https://plc.directory/" + did,
  );
  if (!res.ok) throw new Error("Failed to resolve DID");
  return await res.json();
}

export async function getPDSfromDID(did: string) {
  const doc = await resolveDidDoc(did);
  const service = doc.service?.find((x) => x?.id === "#atproto_pds");
  if (service) {
    //entryway
    if (service.serviceEndpoint.endsWith("bsky.network"))
      return "https://bsky.social";
    // custom pds
    return service.serviceEndpoint;
  }
  throw new Error("No PDS service found in DID document");
}

interface DIDDocument {
  "@context": string[];
  id: string;
  alsoKnownAs?: string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
}

interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export async function resolveDidToHandle(did: string) {
  const doc = await resolveDidDoc(did);
  for (const alias of doc?.alsoKnownAs ?? []) {
    if (alias.includes("at://")) {
      return alias.split("//")[1];
    }
  }
  throw new Error("No handle found in DID document");
}

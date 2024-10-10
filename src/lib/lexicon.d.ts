export namespace SocialPskyActorProfile {
  /** A declaration of a Picosky account profile. */
  interface Record {
    $type: "social.psky.actor.profile";
    /**
     * Maximum string length: 320 \
     * Maximum grapheme length: 32
     */
    nickname?: string;
  }
}

export namespace SocialPskyFeedPost {
  /** A Picosky post containing at most 256 graphemes. */
  interface Record {
    $type: "social.psky.feed.post";
    /**
     * Text content. \
     * Maximum string length: 2560 \
     * Maximum grapheme length: 256
     */
    text: string;
    /** Annotations of text (mentions, URLs, hashtags, etc) */
    facets?: SocialPskyRichtextFacet.Main[];
  }
}

export namespace SocialPskyRichtextFacet {
  /** Annotation of a sub-string within rich text. */
  interface Main {
    [Brand.Type]?: "social.psky.richtext.facet";
    features: Brand.Union<Link | Mention | Room>[];
    index: ByteSlice;
  }
  /** Specifies the sub-string range a facet feature applies to. Start index is inclusive, end index is exclusive. Indices are zero-indexed, counting bytes of the UTF-8 encoded text. NOTE: some languages, like Javascript, use UTF-16 or Unicode codepoints for string slice indexing; in these languages, convert to byte arrays before working with facets. */
  interface ByteSlice {
    [Brand.Type]?: "social.psky.richtext.facet#byteSlice";
    /** Minimum: 0 */
    byteEnd: number;
    /** Minimum: 0 */
    byteStart: number;
  }
  /** Facet feature for a URL. The text URL may have been simplified or truncated, but the facet reference should be a complete URL. */
  interface Link {
    [Brand.Type]?: "social.psky.richtext.facet#link";
    uri: string;
  }
  /** Facet feature for mention of another account. The text is usually a handle, including a '@' prefix, but the facet reference is a DID. */
  interface Mention {
    [Brand.Type]?: "social.psky.richtext.facet#mention";
    did: At.DID;
  }
  /** Facet feature for a room. The text usually includes a '#' prefix, but the facet reference should not (except in the case of a room tag that includes a '#' prefix) - TODO: update when rooms are actually implemented */
  interface Room {
    [Brand.Type]?: "social.psky.richtext.facet#room";
    /**
     * Maximum string length: 640 \
     * Maximum grapheme length: 64
     */
    room: string;
  }

  interface Records {
    "social.psky.actor.profile": SocialPskyActorProfile.Record;
    "social.psky.feed.post": SocialPskyFeedPost.Record;
  }
}

import { describe, expectTypeOf, it } from "vitest";

import type {
  KakaoPostcodeCompleteEvent,
  KakaoPostcodeEmbedBaseOptions,
  KakaoPostcodeEmbedStatus,
  KakaoPostcodeErrorCode,
  KakaoPostcodeNormalizedResult,
  KakaoPostcodeRawResult,
} from "../src/index";

describe("public type exports", () => {
  it("exports the core result and hook types", () => {
    expectTypeOf<KakaoPostcodeRawResult>().toMatchTypeOf<{
      zonecode: string;
      address: string;
      userSelectedType: "R" | "J";
    }>();

    expectTypeOf<KakaoPostcodeNormalizedResult>().toMatchTypeOf<{
      zonecode: string;
      fullRoadAddress: string;
      isRoadAddress: boolean;
    }>();

    expectTypeOf<KakaoPostcodeCompleteEvent>().toMatchTypeOf<{
      raw: KakaoPostcodeRawResult;
      normalized: KakaoPostcodeNormalizedResult;
    }>();

    expectTypeOf<KakaoPostcodeEmbedStatus>().toEqualTypeOf<
      | "idle"
      | "loading-script"
      | "ready"
      | "embedding"
      | "open"
      | "closed"
      | "error"
    >();

    expectTypeOf<KakaoPostcodeEmbedBaseOptions>().toMatchTypeOf<{
      q?: string;
    }>();

    expectTypeOf<KakaoPostcodeErrorCode>().not.toEqualTypeOf<"container_missing">();
  });

  it("does not expose legacy english address aliases on raw results", () => {
    const raw = {} as KakaoPostcodeRawResult;

    // @ts-expect-error legacy alias removed in the unpublished API surface
    raw.englishAddress;
    // @ts-expect-error legacy alias removed in the unpublished API surface
    raw.englishRoadAddress;
    // @ts-expect-error legacy alias removed in the unpublished API surface
    raw.autoEnglishRoadAddress;
    // @ts-expect-error legacy alias removed in the unpublished API surface
    raw.autoEnglishJibunAddress;
  });

  it("does not expose apartmentYn on raw results", () => {
    const raw = {} as KakaoPostcodeRawResult;

    // @ts-expect-error apartment is the only supported apartment flag
    raw.apartmentYn;
  });
});

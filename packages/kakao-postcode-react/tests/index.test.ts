import { describe, expect, it } from "vitest";

import {
  KakaoPostcodeEmbed,
  loadKakaoPostcodeScript,
  normalizeKakaoPostcodeResult,
  useKakaoPostcodeEmbed,
} from "../src/index";

describe("index exports", () => {
  it("exports the primary public APIs", () => {
    expect(KakaoPostcodeEmbed).toBeTypeOf("function");
    expect(useKakaoPostcodeEmbed).toBeTypeOf("function");
    expect(loadKakaoPostcodeScript).toBeTypeOf("function");
    expect(normalizeKakaoPostcodeResult).toBeTypeOf("function");
  });
});

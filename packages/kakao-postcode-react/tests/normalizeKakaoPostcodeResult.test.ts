import { describe, expect, it } from "vitest";

import { normalizeKakaoPostcodeResult } from "../src/normalizeKakaoPostcodeResult";
import type { KakaoPostcodeRawResult } from "../src/types";

const createRawResult = (
  overrides: Partial<KakaoPostcodeRawResult> = {},
): KakaoPostcodeRawResult => ({
  zonecode: "06236",
  address: "서울 강남구 테헤란로 123",
  addressType: "R",
  userSelectedType: "R",
  roadAddress: "서울 강남구 테헤란로 123",
  jibunAddress: "서울 강남구 역삼동 123-4",
  addressEnglish: "123, Teheran-ro, Gangnam-gu, Seoul",
  bname: "",
  buildingName: "",
  apartment: "N",
  autoRoadAddress: "",
  autoJibunAddress: "",
  ...overrides,
});

describe("normalizeKakaoPostcodeResult", () => {
  it("builds extraAddress and fullRoadAddress for road addresses", () => {
    const result = normalizeKakaoPostcodeResult(
      createRawResult({
        bname: "역삼동",
        buildingName: "CP949 빌딩",
        apartment: "Y",
      }),
    );

    expect(result.extraAddress).toBe("(역삼동, CP949 빌딩)");
    expect(result.fullRoadAddress).toBe("서울 강남구 테헤란로 123 (역삼동, CP949 빌딩)");
    expect(result.isRoadAddress).toBe(true);
    expect(result.isJibunAddress).toBe(false);
  });

  it("marks jibun selections correctly", () => {
    const result = normalizeKakaoPostcodeResult(
      createRawResult({
        address: "서울 강남구 역삼동 123-4",
        addressType: "J",
        userSelectedType: "J",
      }),
    );

    expect(result.isRoadAddress).toBe(false);
    expect(result.isJibunAddress).toBe(true);
    expect(result.fullJibunAddress).toBe("서울 강남구 역삼동 123-4");
  });

  it("only includes legally valid extra address segments", () => {
    const result = normalizeKakaoPostcodeResult(
      createRawResult({
        bname: "서초리",
        buildingName: "CP949 타워",
        apartment: "N",
      }),
    );

    expect(result.extraAddress).toBe("");
    expect(result.fullRoadAddress).toBe("서울 강남구 테헤란로 123");
  });

  it("includes bname values that end with 가", () => {
    const result = normalizeKakaoPostcodeResult(
      createRawResult({
        bname: "명동1가",
      }),
    );

    expect(result.extraAddress).toBe("(명동1가)");
    expect(result.fullRoadAddress).toBe("서울 강남구 테헤란로 123 (명동1가)");
  });

  it("preserves the official Kakao addressEnglish field in normalized output", () => {
    const result = normalizeKakaoPostcodeResult(
      createRawResult({
        addressEnglish: "123, Teheran-ro, Gangnam-gu, Seoul, Republic of Korea",
      }),
    );

    expect(result.englishAddress).toBe(
      "123, Teheran-ro, Gangnam-gu, Seoul, Republic of Korea",
    );
  });
});

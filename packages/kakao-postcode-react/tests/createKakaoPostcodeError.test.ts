import { describe, expect, it } from "vitest";

import { createKakaoPostcodeError } from "../src/createKakaoPostcodeError";

describe("createKakaoPostcodeError", () => {
  it("creates an error with the provided code and message", () => {
    const error = createKakaoPostcodeError(
      "embed_failed",
      "Failed to initialize Kakao Postcode embed.",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      code: "embed_failed",
      message: "Failed to initialize Kakao Postcode embed.",
    });
    expect(error.cause).toBeUndefined();
  });

  it("attaches cause only when one is provided", () => {
    const cause = new Error("boom");
    const error = createKakaoPostcodeError(
      "script_load_error",
      "Failed to load the Kakao Postcode script.",
      cause,
    );

    expect(error.cause).toBe(cause);
  });
});

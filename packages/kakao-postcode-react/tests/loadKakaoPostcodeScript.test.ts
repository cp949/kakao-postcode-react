import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetKakaoPostcodeScriptLoaderForTests,
  loadKakaoPostcodeScript,
} from "../src/loadKakaoPostcodeScript";

describe("loadKakaoPostcodeScript", () => {
  beforeEach(() => {
    __resetKakaoPostcodeScriptLoaderForTests();
    delete window.kakao;
    delete window.daum;
    document.head.innerHTML = "";
  });

  afterEach(() => {
    __resetKakaoPostcodeScriptLoaderForTests();
  });

  it("returns an existing kakao constructor without injecting a script", async () => {
    const postcode = vi.fn();
    window.kakao = { Postcode: postcode as never };

    const ctor = await loadKakaoPostcodeScript();

    expect(ctor).toBe(postcode);
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  it("injects only one script for concurrent calls", async () => {
    const first = loadKakaoPostcodeScript();
    const second = loadKakaoPostcodeScript();
    const script = document.querySelector("script");

    expect(script).not.toBeNull();
    expect(document.querySelectorAll("script")).toHaveLength(1);

    const postcode = vi.fn();
    window.kakao = { Postcode: postcode as never };
    script?.dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(postcode);
    await expect(second).resolves.toBe(postcode);
  });

  it("rejects all concurrent callers when the shared script load fails", async () => {
    const first = loadKakaoPostcodeScript();
    const second = loadKakaoPostcodeScript();
    const script = document.querySelector("script");

    script?.dispatchEvent(new Event("error"));

    await expect(first).rejects.toMatchObject({
      code: "script_load_error",
    });
    await expect(second).rejects.toMatchObject({
      code: "script_load_error",
    });
  });

  it("reuses an existing Kakao postcode script tag instead of injecting a duplicate", async () => {
    const existingScript = document.createElement("script");
    existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    document.head.append(existingScript);

    const promise = loadKakaoPostcodeScript();

    expect(document.querySelectorAll("script")).toHaveLength(1);

    const postcode = vi.fn();
    window.kakao = { Postcode: postcode as never };
    existingScript.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBe(postcode);
    expect(document.head.querySelectorAll(`script[src="${existingScript.src}"]`)).toHaveLength(1);
  });

  it("rejects instead of hanging when a reused script has no status and no constructor", async () => {
    vi.useFakeTimers();

    try {
      const existingScript = document.createElement("script");
      existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      document.head.append(existingScript);

      const promise = loadKakaoPostcodeScript();
      const rejection = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(10_000);

      await expect(rejection).resolves.toMatchObject({
        code: "postcode_unavailable",
      });
      expect(document.querySelectorAll("script")).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not mark a reused external script as failed after timing out", async () => {
    vi.useFakeTimers();

    try {
      const existingScript = document.createElement("script");
      existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      document.head.append(existingScript);

      const promise = loadKakaoPostcodeScript();
      const rejection = promise.catch((error) => error);

      await vi.advanceTimersByTimeAsync(10_000);
      await expect(rejection).resolves.toMatchObject({
        code: "postcode_unavailable",
      });

      expect(existingScript.getAttribute("data-kakao-postcode-status")).toBeNull();
      expect(document.head.querySelectorAll(`script[src="${existingScript.src}"]`)).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("retries against the same reused script after a timeout instead of replacing it", async () => {
    vi.useFakeTimers();

    try {
      const existingScript = document.createElement("script");
      existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      document.head.append(existingScript);

      const firstAttempt = loadKakaoPostcodeScript();
      const firstRejection = firstAttempt.catch((error) => error);
      await vi.advanceTimersByTimeAsync(10_000);
      await expect(firstRejection).resolves.toMatchObject({
        code: "postcode_unavailable",
      });

      const secondAttempt = loadKakaoPostcodeScript();
      const postcode = vi.fn();
      window.kakao = { Postcode: postcode as never };
      existingScript.dispatchEvent(new Event("load"));

      await expect(secondAttempt).resolves.toBe(postcode);
      expect(document.head.querySelectorAll(`script[src="${existingScript.src}"]`)).toHaveLength(1);
      expect(document.querySelector("script")).toBe(existingScript);
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects with a script_load_error when the script fails to load", async () => {
    const promise = loadKakaoPostcodeScript();
    const script = document.querySelector("script");

    script?.dispatchEvent(new Event("error"));

    await expect(promise).rejects.toMatchObject({
      code: "script_load_error",
    });
  });

  it("rejects immediately when an existing Kakao script tag is already marked as failed", async () => {
    const existingScript = document.createElement("script");
    existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    existingScript.setAttribute("data-kakao-postcode-status", "error");
    document.head.append(existingScript);

    const promise = loadKakaoPostcodeScript();
    const replacementScript = document.querySelector("script");
    const postcode = vi.fn();

    expect(document.querySelectorAll("script")).toHaveLength(1);
    expect(replacementScript).not.toBe(existingScript);

    window.kakao = { Postcode: postcode as never };
    replacementScript?.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBe(postcode);
    expect(document.querySelectorAll("script")).toHaveLength(1);
  });

  it("retries successfully after a previous script load failure", async () => {
    const firstAttempt = loadKakaoPostcodeScript();
    const firstScript = document.querySelector("script");

    firstScript?.dispatchEvent(new Event("error"));

    await expect(firstAttempt).rejects.toMatchObject({
      code: "script_load_error",
    });

    const secondAttempt = loadKakaoPostcodeScript();
    const replacementScript = document.querySelector("script");
    const postcode = vi.fn();

    expect(document.querySelectorAll("script")).toHaveLength(1);
    expect(replacementScript).not.toBe(firstScript);

    window.kakao = { Postcode: postcode as never };
    replacementScript?.dispatchEvent(new Event("load"));

    await expect(secondAttempt).resolves.toBe(postcode);
  });

  it("shares one replacement script while recovering from a failed existing tag", async () => {
    const existingScript = document.createElement("script");
    existingScript.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    existingScript.setAttribute("data-kakao-postcode-status", "error");
    document.head.append(existingScript);

    const first = loadKakaoPostcodeScript();
    const second = loadKakaoPostcodeScript();
    const scripts = document.querySelectorAll("script");
    const replacementScript = scripts[0];
    const postcode = vi.fn();

    expect(scripts).toHaveLength(1);
    expect(replacementScript).not.toBe(existingScript);

    window.kakao = { Postcode: postcode as never };
    replacementScript?.dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(postcode);
    await expect(second).resolves.toBe(postcode);
  });

  it("supports the legacy daum constructor as a fallback", async () => {
    const promise = loadKakaoPostcodeScript();
    const script = document.querySelector("script");
    const postcode = vi.fn();

    window.daum = { Postcode: postcode as never };
    script?.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBe(postcode);
  });
});

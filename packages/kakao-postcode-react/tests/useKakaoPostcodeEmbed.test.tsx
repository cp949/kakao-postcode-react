import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEffect, useState } from "react";

import type {
  KakaoPostcodeCloseState,
  KakaoPostcodeConstructor,
  KakaoPostcodeRawResult,
  KakaoPostcodeSize,
} from "../src/types";
import { useKakaoPostcodeEmbed } from "../src/useKakaoPostcodeEmbed";

const { loadKakaoPostcodeScriptMock } = vi.hoisted(() => ({
  loadKakaoPostcodeScriptMock: vi.fn<() => Promise<KakaoPostcodeConstructor>>(),
}));

vi.mock("../src/loadKakaoPostcodeScript", () => ({
  loadKakaoPostcodeScript: loadKakaoPostcodeScriptMock,
}));

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
  bname: "역삼동",
  buildingName: "CP949 빌딩",
  apartment: "Y",
  autoRoadAddress: "",
  autoJibunAddress: "",
  ...overrides,
});

const createPostcodeConstructor = <TOptions extends object>(
  factory: (options: TOptions) => {
    embed: (
      element: HTMLElement,
      embedOptions?: {
        q?: string;
        autoClose?: boolean;
      },
    ) => void;
  },
) => {
  const constructorMock = vi.fn();

  function Postcode(
    this: {
      embed: (
        element: HTMLElement,
        embedOptions?: {
          q?: string;
          autoClose?: boolean;
        },
      ) => void;
    },
    options: TOptions,
  ) {
    constructorMock(options);
    const instance = factory(options);
    this.embed = instance.embed;
  }

  return {
    Postcode: Postcode as unknown as KakaoPostcodeConstructor,
    constructorMock,
  };
};

describe("useKakaoPostcodeEmbed", () => {
  beforeEach(() => {
    loadKakaoPostcodeScriptMock.mockReset();
  });

  it("embeds into the container and reports open status", async () => {
    const embed = vi.fn();
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() => useKakaoPostcodeEmbed());
    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(loadKakaoPostcodeScriptMock).toHaveBeenCalledTimes(1);
    expect(constructorMock).toHaveBeenCalledTimes(1);
    expect(embed).toHaveBeenCalledWith(container);
  });

  it("keeps the embed open across rerenders without resetting to idle", async () => {
    const embed = vi.fn();
    const statusHistory: string[] = [];
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const TestComponent = () => {
      const [count, setCount] = useState(0);
      const { containerRef, status } = useKakaoPostcodeEmbed();

      useEffect(() => {
        statusHistory.push(status);
      }, [status]);

      return (
        <div>
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            rerender
          </button>
          <span data-testid="render-count">{count}</span>
          <span data-testid="status">{status}</span>
          <div ref={containerRef} />
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("open");
    });

    const openCountBeforeRerender = statusHistory.filter((status) => status === "open").length;

    fireEvent.click(screen.getByRole("button", { name: "rerender" }));

    await waitFor(() => {
      expect(screen.getByTestId("render-count")).toHaveTextContent("1");
    });

    expect(screen.getByTestId("status")).toHaveTextContent("open");
    expect(statusHistory.slice(openCountBeforeRerender)).not.toContain("idle");
    expect(loadKakaoPostcodeScriptMock).toHaveBeenCalledTimes(1);
    expect(constructorMock).toHaveBeenCalledTimes(1);
    expect(embed).toHaveBeenCalledTimes(1);
  });

  it("returns raw and normalized results from onComplete", async () => {
    let oncomplete: ((result: KakaoPostcodeRawResult) => void) | undefined;
    const events: unknown[] = [];

    const { Postcode } = createPostcodeConstructor<{
      oncomplete?: (result: KakaoPostcodeRawResult) => void;
    }>((options) => {
      oncomplete = options.oncomplete;
      return { embed: vi.fn() };
    });

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() =>
      useKakaoPostcodeEmbed({
        onComplete: (event) => {
          events.push(event);
        },
      }),
    );

    act(() => {
      result.current.containerRef(document.createElement("div"));
    });

    await waitFor(() => {
      expect(oncomplete).toBeTypeOf("function");
    });

    act(() => {
      oncomplete?.(createRawResult());
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      raw: createRawResult(),
      normalized: {
        zonecode: "06236",
        isRoadAddress: true,
        fullRoadAddress: "서울 강남구 테헤란로 123 (역삼동, CP949 빌딩)",
      },
    });
  });

  it("forwards resize and close callbacks, and clears the container on close()", async () => {
    let onresize: ((size: KakaoPostcodeSize) => void) | undefined;
    let onclose: ((state: KakaoPostcodeCloseState) => void) | undefined;
    const events: Array<KakaoPostcodeSize | KakaoPostcodeCloseState> = [];

    const { Postcode } = createPostcodeConstructor<{
      onresize?: (size: KakaoPostcodeSize) => void;
      onclose?: (state: KakaoPostcodeCloseState) => void;
    }>((options) => {
      onresize = options.onresize;
      onclose = options.onclose;
      return {
        embed: (element: HTMLElement) => {
          element.innerHTML = "<iframe title='postcode'></iframe>";
        },
      };
    });

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() =>
      useKakaoPostcodeEmbed({
        onResize: (size) => {
          events.push(size);
        },
        onClose: (state) => {
          events.push(state);
        },
      }),
    );

    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    act(() => {
      onresize?.({ width: 320, height: 480 });
      onclose?.("COMPLETE_CLOSE");
    });

    expect(events).toContainEqual({ width: 320, height: 480 });
    expect(events).toContain("COMPLETE_CLOSE");
    expect(container.innerHTML).toBe("");
    expect(result.current.status).toBe("closed");

    act(() => {
      result.current.close();
    });

    expect(container.innerHTML).toBe("");
    expect(result.current.status).toBe("closed");
  });

  it("reloads after close without requiring a new container mount", async () => {
    const embed = vi.fn().mockImplementation((element: HTMLElement) => {
      element.innerHTML = "<iframe title='postcode'></iframe>";
    });
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() => useKakaoPostcodeEmbed());
    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.status).toBe("closed");
    expect(container.innerHTML).toBe("");

    act(() => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(constructorMock).toHaveBeenCalledTimes(2);
    expect(embed).toHaveBeenCalledTimes(2);
  });

  it("clears the previous error when close() is called from an error state", async () => {
    let rejectPostcode: ((reason?: unknown) => void) | undefined;

    loadKakaoPostcodeScriptMock.mockImplementation(
      () =>
        new Promise<KakaoPostcodeConstructor>((_resolve, reject) => {
          rejectPostcode = reject;
        }),
    );

    const { result } = renderHook(() => useKakaoPostcodeEmbed());

    act(() => {
      result.current.containerRef(document.createElement("div"));
    });

    act(() => {
      rejectPostcode?.(Object.assign(new Error("boom"), { code: "script_load_error" }));
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toMatchObject({
      code: "script_load_error",
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.status).toBe("closed");
    expect(result.current.error).toBeNull();
  });

  it("passes embed autoClose options to postcode.embed()", async () => {
    const embed = vi.fn();
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() =>
      useKakaoPostcodeEmbed({
        autoClose: false,
      }),
    );

    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(constructorMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ autoClose: false }),
    );
    expect(embed).toHaveBeenCalledWith(container, { autoClose: false });
  });

  it("passes q through embed options", async () => {
    const embed = vi.fn();
    const { Postcode } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result } = renderHook(() =>
      useKakaoPostcodeEmbed({
        q: "판교역",
      }),
    );

    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(embed).toHaveBeenCalledWith(container, { q: "판교역" });
  });

  it("re-embeds when runtime options change after mount", async () => {
    const embed = vi.fn();
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result, rerender } = renderHook(
      ({ height, theme }) =>
        useKakaoPostcodeEmbed({
          height,
          theme,
        }),
      {
        initialProps: {
          height: 420,
          theme: { bgColor: "#ffffff" },
        },
      },
    );

    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(constructorMock).toHaveBeenCalledTimes(1);
    expect(embed).toHaveBeenCalledTimes(1);

    rerender({
      height: 520,
      theme: { bgColor: "#f5f5f5" },
    });

    await waitFor(() => {
      expect(constructorMock).toHaveBeenCalledTimes(2);
    });

    expect(embed).toHaveBeenCalledTimes(2);
    expect(embed).toHaveBeenNthCalledWith(2, container);
  });

  it("exposes loader failures as hook errors", async () => {
    loadKakaoPostcodeScriptMock.mockRejectedValue(
      Object.assign(new Error("boom"), { code: "script_load_error" }),
    );

    const { result } = renderHook(() => useKakaoPostcodeEmbed());

    act(() => {
      result.current.containerRef(document.createElement("div"));
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toMatchObject({
      code: "script_load_error",
    });
  });

  it("does not reopen after close() while the script is still loading", async () => {
    let resolvePostcode: ((value: KakaoPostcodeConstructor) => void) | undefined;
    const embed = vi.fn();
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockImplementation(
      () =>
        new Promise<KakaoPostcodeConstructor>((resolve) => {
          resolvePostcode = resolve;
        }),
    );

    const { result } = renderHook(() => useKakaoPostcodeEmbed());
    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("loading-script");
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.status).toBe("closed");

    await act(async () => {
      resolvePostcode?.(Postcode);
      await Promise.resolve();
    });

    expect(result.current.status).toBe("closed");
    expect(constructorMock).not.toHaveBeenCalled();
    expect(embed).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe("");
  });

  it("does not re-embed when only callback props change across rerenders", async () => {
    const embed = vi.fn().mockImplementation((element: HTMLElement) => {
      element.innerHTML = "<iframe title='postcode'></iframe>";
    });
    const { Postcode, constructorMock } = createPostcodeConstructor(() => ({ embed }));

    loadKakaoPostcodeScriptMock.mockResolvedValue(Postcode as KakaoPostcodeConstructor);

    const { result, rerender } = renderHook(
      ({ onComplete, onClose, onResize }) =>
        useKakaoPostcodeEmbed({
          onComplete,
          onClose,
          onResize,
        }),
      {
        initialProps: {
          onComplete: vi.fn(),
          onClose: vi.fn(),
          onResize: vi.fn(),
        },
      },
    );

    const container = document.createElement("div");

    act(() => {
      result.current.containerRef(container);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    rerender({
      onComplete: vi.fn(),
      onClose: vi.fn(),
      onResize: vi.fn(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("open");
    });

    expect(constructorMock).toHaveBeenCalledTimes(1);
    expect(embed).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toContain("iframe");
  });
});

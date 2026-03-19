import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { KakaoPostcodeError } from "../src/types";
import { KakaoPostcodeEmbed } from "../src/KakaoPostcodeEmbed";

const { useKakaoPostcodeEmbedMock } = vi.hoisted(() => ({
  useKakaoPostcodeEmbedMock: vi.fn(),
}));

vi.mock("../src/useKakaoPostcodeEmbed", () => ({
  useKakaoPostcodeEmbed: useKakaoPostcodeEmbedMock,
}));

describe("KakaoPostcodeEmbed", () => {
  beforeEach(() => {
    useKakaoPostcodeEmbedMock.mockReset();
  });

  it("renders an embed container", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "idle",
      error: null,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed />);

    expect(screen.getByTestId("kakao-postcode-embed")).toBeInTheDocument();
  });

  it("shows loading UI while the script is loading", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "loading-script",
      error: null,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed />);

    expect(screen.getByText("Loading postcode search...")).toBeInTheDocument();
  });

  it("shows a custom loading fallback when provided", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "loading-script",
      error: null,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed loadingFallback={<div>Custom loading...</div>} />);

    expect(screen.getByText("Custom loading...")).toBeInTheDocument();
  });

  it("shows alert UI on error", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "error",
      error: { code: "script_load_error", message: "boom" } as KakaoPostcodeError,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed />);

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load postcode search.");
  });

  it("calls a function error fallback with the hook error", () => {
    const error = { code: "script_load_error", message: "boom" } as KakaoPostcodeError;
    const errorFallback = vi.fn(() => <div>Custom error UI</div>);

    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "error",
      error,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed errorFallback={errorFallback} />);

    expect(errorFallback).toHaveBeenCalledWith(error);
    expect(screen.getByRole("alert")).toHaveTextContent("Custom error UI");
  });

  it("collapses the embed container when the hook is in an error state", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "error",
      error: { code: "embed_failed", message: "boom" } as KakaoPostcodeError,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(<KakaoPostcodeEmbed height={400} />);

    expect(screen.getByTestId("kakao-postcode-embed")).toHaveStyle({
      height: "0px",
    });
  });

  it("applies className, style, and height overrides", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "open",
      error: null,
      close: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <KakaoPostcodeEmbed
        className="postcode-root"
        style={{ border: "1px solid red" }}
        height={480}
      />,
    );

    const root = screen.getByTestId("kakao-postcode-root");
    const embed = screen.getByTestId("kakao-postcode-embed");

    expect(root).toHaveClass("postcode-root");
    expect(root.getAttribute("style")).toContain("border: 1px solid red");
    expect(embed).toHaveStyle({ height: "480px" });
    expect(useKakaoPostcodeEmbedMock).toHaveBeenCalledWith(
      expect.objectContaining({ height: 480 }),
    );
  });

  it("forwards updated runtime options to the hook on rerender", () => {
    useKakaoPostcodeEmbedMock.mockReturnValue({
      containerRef: vi.fn(),
      status: "open",
      error: null,
      close: vi.fn(),
      reload: vi.fn(),
    });

    const { rerender } = render(
      <KakaoPostcodeEmbed
        height={420}
        theme={{ bgColor: "#ffffff" }}
      />,
    );

    rerender(
      <KakaoPostcodeEmbed
        height={520}
        theme={{ bgColor: "#f5f5f5" }}
      />,
    );

    expect(useKakaoPostcodeEmbedMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        height: 420,
        theme: { bgColor: "#ffffff" },
      }),
    );
    expect(useKakaoPostcodeEmbedMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        height: 520,
        theme: { bgColor: "#f5f5f5" },
      }),
    );
  });
});

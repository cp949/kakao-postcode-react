import React, { type CSSProperties } from "react";

import type { KakaoPostcodeEmbedComponentProps } from "./types";
import { useKakaoPostcodeEmbed } from "./useKakaoPostcodeEmbed";

// 숫자 높이 값을 CSS에서 바로 이해할 수 있는 px 문자열로 맞춘다.
// 이미 문자열이면 사용자가 전달한 단위를 그대로 유지한다.
const toCssSize = (
  value: number | string | undefined,
): CSSProperties["height"] => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

// 카카오 우편번호 검색 UI를 React 컴포넌트로 감싼 프레젠테이션 레이어다.
// 실제 임베드 생성과 상태 관리는 훅에 위임하고, 여기서는 상태별 렌더링만 담당한다.
export const KakaoPostcodeEmbed = ({
  className,
  style,
  height = 400,
  loadingFallback,
  errorFallback,
  ...options
}: KakaoPostcodeEmbedComponentProps) => {
  const { containerRef, error, status } = useKakaoPostcodeEmbed({
    ...options,
    height,
  });

  // 오류 렌더 함수를 사용하는 경우를 위해 기본 오류 객체를 준비해 둔다.
  const fallbackError =
    error ??
    ({
      code: "embed_failed",
      message: "Unable to load postcode search.",
      name: "KakaoPostcodeError",
    } as const);

  return React.createElement(
    "div",
    {
      className,
      style,
      // 테스트 코드에서 루트 노드를 안정적으로 찾을 수 있게 식별자를 부여한다.
      "data-testid": "kakao-postcode-root",
    },
    status === "loading-script"
      ? (loadingFallback ??
          React.createElement("div", null, "Loading postcode search..."))
      : null,
    status === "error"
      ? React.createElement(
          "div",
          { role: "alert" },
          typeof errorFallback === "function"
            ? errorFallback(fallbackError)
            : (errorFallback ?? "Unable to load postcode search."),
        )
      : null,
    React.createElement("div", {
      ref: containerRef,
      "data-testid": "kakao-postcode-embed",
      // 오류 상태에서는 임베드 영역을 접어 레이아웃에 남는 빈 공간을 줄인다.
      style: { height: status === "error" ? 0 : toCssSize(height) },
    }),
  );
};

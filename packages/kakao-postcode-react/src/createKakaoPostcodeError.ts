import type { KakaoPostcodeError, KakaoPostcodeErrorCode } from "./types";

// 라이브러리 내부 오류를 일관된 구조로 만드는 헬퍼다.
// 표준 Error에 코드와 원인 정보를 붙여 소비자가 분기 처리하기 쉽게 한다.
export const createKakaoPostcodeError = (
  code: KakaoPostcodeErrorCode,
  message: string,
  cause?: unknown,
): KakaoPostcodeError => {
  const error = new Error(message) as KakaoPostcodeError;
  error.code = code;

  // 원본 예외를 함께 보존해 디버깅 단서를 잃지 않도록 한다.
  if (cause !== undefined) {
    error.cause = cause;
  }

  return error;
};

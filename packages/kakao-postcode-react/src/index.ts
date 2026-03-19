// 패키지 루트에서 사용할 공개 타입과 런타임 API를 한 곳으로 모아 재수출한다.
export type {
  KakaoPostcodeCloseState,
  KakaoPostcodeCompleteEvent,
  KakaoPostcodeConstructor,
  KakaoPostcodeEmbedBaseOptions,
  KakaoPostcodeEmbedComponentProps,
  KakaoPostcodeEmbedStatus,
  KakaoPostcodeError,
  KakaoPostcodeErrorCode,
  KakaoPostcodeInstance,
  KakaoPostcodeNormalizedResult,
  KakaoPostcodeRawResult,
  KakaoPostcodeSize,
  KakaoPostcodeTheme,
} from "./types";

export { loadKakaoPostcodeScript } from "./loadKakaoPostcodeScript";
export { normalizeKakaoPostcodeResult } from "./normalizeKakaoPostcodeResult";
export { KakaoPostcodeEmbed } from "./KakaoPostcodeEmbed";
export { useKakaoPostcodeEmbed } from "./useKakaoPostcodeEmbed";

import type { CSSProperties, ReactNode } from "react";

// 카카오 우편번호 서비스가 사용하는 주소 타입 약어다.
// R은 도로명 주소, J는 지번 주소를 의미한다.
export type KakaoPostcodeAddressType = "R" | "J";

// 카카오 스크립트가 검색 완료 시 전달하는 원본 응답 구조다.
// 가능하면 공식 필드명을 유지해 원본 데이터 접근성을 보장한다.
export type KakaoPostcodeRawResult = {
  // 5자리 우편번호
  zonecode: string;
  // 사용자가 최종 선택한 기본 주소
  address: string;
  // 영문 기본 주소
  addressEnglish: string;
  // 검색 결과가 속한 주소 분류
  addressType: KakaoPostcodeAddressType;
  // 사용자가 실제로 선택한 주소 분류
  userSelectedType: KakaoPostcodeAddressType;
  // 도로명 주소
  roadAddress: string;
  // 영문 도로명 주소
  roadAddressEnglish?: string;
  // 지번 주소
  jibunAddress: string;
  // 영문 지번 주소
  jibunAddressEnglish?: string;
  // 법정동/법정리 이름
  bname: string;
  bname1?: string;
  bname2?: string;
  // 건물명
  buildingName: string;
  // 공동주택 여부
  apartment: "Y" | "N";
  // 시/도
  sido?: string;
  // 시/군/구
  sigungu?: string;
  // 시군구 코드
  sigunguCode?: string;
  // 도로명 코드
  roadnameCode?: string;
  // 도로명
  roadname?: string;
  // 법정동 코드
  bcode?: string;
  // 건물 관리 코드
  buildingCode?: string;
  // 행정동명
  hname?: string;
  // 사용자가 입력한 검색어
  query?: string;
  // 검색 결과 목록에서 직접 항목을 고르지 않았는지 여부
  noSelected?: "Y" | "N";
  // 자동완성으로 추정된 도로명 주소
  autoRoadAddress: string;
  autoRoadAddressEnglish?: string;
  // 자동완성으로 추정된 지번 주소
  autoJibunAddress: string;
  autoJibunAddressEnglish?: string;
  // 사용자 언어 설정
  userLanguageType?: "K" | "E";
};

// 애플리케이션 코드에서 자주 쓰는 필드만 정리한 정규화 결과다.
export type KakaoPostcodeNormalizedResult = {
  zonecode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  // 영문 주소가 없더라도 항상 문자열이 되도록 정규화된다.
  englishAddress: string;
  // "(법정동, 건물명)" 형태의 참고 주소
  extraAddress: string;
  // 참고 주소가 반영된 최종 도로명 주소
  fullRoadAddress: string;
  // 현재는 원본 지번 주소와 동일한 전체 지번 주소
  fullJibunAddress: string;
  // 도로명 주소 선택 여부
  isRoadAddress: boolean;
  // 지번 주소 선택 여부
  isJibunAddress: boolean;
  userSelectedType: KakaoPostcodeAddressType;
  addressType: KakaoPostcodeAddressType;
};

// 검색 완료 콜백에서 전달하는 이벤트 객체다.
export type KakaoPostcodeCompleteEvent = {
  raw: KakaoPostcodeRawResult;
  normalized: KakaoPostcodeNormalizedResult;
};

// resize 콜백에 전달되는 임베드 영역 크기 정보다.
export type KakaoPostcodeSize = {
  width: number;
  height: number;
};

// 임베드 UI가 닫힌 사유를 나타낸다.
export type KakaoPostcodeCloseState = "FORCE_CLOSE" | "COMPLETE_CLOSE";

// 카카오 우편번호 UI 색상 테마 옵션이다.
export type KakaoPostcodeTheme = {
  bgColor?: string;
  searchBgColor?: string;
  contentBgColor?: string;
  pageBgColor?: string;
  textColor?: string;
  queryTextColor?: string;
  postcodeTextColor?: string;
  emphTextColor?: string;
  outlineColor?: string;
};

// 훅과 컴포넌트가 외부에 노출하는 상태 머신이다.
export type KakaoPostcodeEmbedStatus =
  | "idle"
  | "loading-script"
  | "ready"
  | "embedding"
  | "open"
  | "closed"
  | "error";

// 라이브러리 내부에서 구분하는 오류 코드 집합이다.
export type KakaoPostcodeErrorCode =
  | "browser_only"
  | "script_load_error"
  | "postcode_unavailable"
  | "embed_failed";

// 표준 Error에 라이브러리 전용 코드와 원인 정보를 추가한 타입이다.
export type KakaoPostcodeError = Error & {
  code: KakaoPostcodeErrorCode;
  cause?: unknown;
};

// 훅과 컴포넌트가 공통으로 받는 기본 옵션이다.
export type KakaoPostcodeEmbedBaseOptions = {
  // 검색 UI 애니메이션 사용 여부
  animation?: boolean;
  // 주소 선택 후 자동 종료 여부
  autoClose?: boolean;
  // 임베드 생성 후 입력창 자동 포커스 여부
  focusInput?: boolean;
  // 임베드 높이
  height?: number | string;
  // 영문 전환 버튼 숨김 여부
  hideEngBtn?: boolean;
  // 지도 버튼 숨김 여부
  hideMapBtn?: boolean;
  // 자동완성 목록 최대 개수
  maxSuggestItems?: number;
  // 안내 문구 표시 모드
  pleaseReadGuide?: number;
  // 초기 검색어
  q?: string;
  // 축약 주소 표기 사용 여부
  shorthand?: boolean;
  // submit 모드 사용 여부
  submitMode?: boolean;
  // 색상 테마 커스터마이징
  theme?: KakaoPostcodeTheme;
  // 서비스 배너 링크 사용 여부
  useBannerLink?: boolean;
  // 임베드 너비
  width?: number | string;
  // 주소 선택 완료 콜백
  onComplete?: (event: KakaoPostcodeCompleteEvent) => void;
  // 임베드 크기 변경 콜백
  onResize?: (size: KakaoPostcodeSize) => void;
  // 임베드 닫힘 콜백
  onClose?: (state: KakaoPostcodeCloseState) => void;
};

// React 컴포넌트에서만 추가로 받는 표시 관련 옵션이다.
export type KakaoPostcodeEmbedComponentProps = KakaoPostcodeEmbedBaseOptions & {
  className?: string;
  style?: CSSProperties;
  // 스크립트 로딩 중 대신 렌더할 UI
  loadingFallback?: ReactNode;
  // 오류 시 대신 렌더할 UI 또는 렌더 함수
  errorFallback?: ReactNode | ((error: KakaoPostcodeError) => ReactNode);
};

// 카카오 embed 메서드에 직접 전달하는 옵션만 분리한 타입이다.
export type KakaoPostcodeEmbedOptions = {
  q?: string;
  autoClose?: boolean;
};

// 생성된 Postcode 인스턴스가 제공하는 최소 인터페이스다.
export type KakaoPostcodeInstance = {
  embed: (element: HTMLElement, options?: KakaoPostcodeEmbedOptions) => void;
};

// new Postcode(...) 생성자에 전달하는 옵션 타입이다.
export type KakaoPostcodeConstructorOptions = {
  animation?: boolean;
  focusInput?: boolean;
  height?: number | string;
  hideEngBtn?: boolean;
  hideMapBtn?: boolean;
  maxSuggestItems?: number;
  onclose?: (state: KakaoPostcodeCloseState) => void;
  oncomplete?: (result: KakaoPostcodeRawResult) => void;
  onresize?: (size: KakaoPostcodeSize) => void;
  pleaseReadGuide?: number;
  shorthand?: boolean;
  submitMode?: boolean;
  theme?: KakaoPostcodeTheme;
  useBannerLink?: boolean;
  width?: number | string;
};

// 카카오 우편번호 생성자 시그니처다.
export type KakaoPostcodeConstructor = new (
  options: KakaoPostcodeConstructorOptions,
) => KakaoPostcodeInstance;

declare global {
  interface Window {
    // 최신 전역 네임스페이스
    kakao?: {
      Postcode?: KakaoPostcodeConstructor;
    };
    // 하위 호환용 기존 전역 네임스페이스
    daum?: {
      Postcode?: KakaoPostcodeConstructor;
    };
  }
}

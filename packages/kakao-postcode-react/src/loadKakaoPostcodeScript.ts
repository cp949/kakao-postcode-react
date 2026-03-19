import { createKakaoPostcodeError } from "./createKakaoPostcodeError";
import type { KakaoPostcodeConstructor } from "./types";

// 카카오 우편번호 스크립트를 불러오는 공식 CDN 주소다.
const KAKAO_POSTCODE_SCRIPT_URL =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

// script 태그에 현재 로드 상태를 기록하기 위한 사용자 정의 속성이다.
const SCRIPT_STATUS_ATTRIBUTE = "data-kakao-postcode-status";

// 이미 존재하는 script 태그를 재사용할 때 이벤트가 오지 않는 상황에 대비한 제한 시간이다.
const REUSED_SCRIPT_TIMEOUT_MS = 10_000;

// 여러 호출이 동시에 들어와도 하나의 로딩 작업만 공유하도록 Promise를 캐시한다.
let scriptLoadingPromise: Promise<KakaoPostcodeConstructor> | null = null;

// 최신 네임스페이스(kakao)와 하위 호환 네임스페이스(daum) 중
// 실제로 등록된 Postcode 생성자를 찾는다.
const getPostcodeConstructor = (): KakaoPostcodeConstructor | undefined =>
  window.kakao?.Postcode ?? window.daum?.Postcode;

// 동일한 src를 가진 script 태그가 이미 DOM에 있는지 확인한다.
const getExistingScript = (): HTMLScriptElement | null =>
  document.querySelector(`script[src="${KAKAO_POSTCODE_SCRIPT_URL}"]`);

const getOrCreateScript = (): { script: HTMLScriptElement; reused: boolean } => {
  const existingScript = getExistingScript();

  // 실패 상태로 끝난 이전 script는 재시도를 위해 제거한다.
  if (existingScript?.getAttribute(SCRIPT_STATUS_ATTRIBUTE) === "error") {
    existingScript.remove();
  }

  const reusableScript = getExistingScript();

  if (reusableScript) {
    // 이미 존재하는 태그가 있으면 중복 삽입하지 않고 그대로 사용한다.
    return {
      script: reusableScript,
      reused: true,
    };
  }

  // 없는 경우에만 새 script 태그를 만들어 head에 추가한다.
  const script = document.createElement("script");
  script.async = true;
  script.src = KAKAO_POSTCODE_SCRIPT_URL;
  document.head.append(script);

  return {
    script,
    reused: false,
  };
};

const createScriptLoadPromise = (
  script: HTMLScriptElement,
  reused: boolean,
): Promise<KakaoPostcodeConstructor> =>
  new Promise<KakaoPostcodeConstructor>((resolve, reject) => {
    let timeoutId: number | undefined;

    // 성공/실패 어느 쪽으로 끝나더라도 타이머를 정리한다.
    const cleanup = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

    // 스크립트 로드 이후 전역 생성자가 정상 등록되었는지 확인한다.
    const resolvePostcodeConstructor = () => {
      cleanup();
      const postcodeConstructor = getPostcodeConstructor();

      if (!postcodeConstructor) {
        script.setAttribute(SCRIPT_STATUS_ATTRIBUTE, "error");
        scriptLoadingPromise = null;
        reject(
          createKakaoPostcodeError(
            "postcode_unavailable",
            "Kakao Postcode constructor was not found after loading the script.",
          ),
        );
        return;
      }

      script.setAttribute(SCRIPT_STATUS_ATTRIBUTE, "loaded");
      resolve(postcodeConstructor);
    };

    // 네트워크 오류나 로딩 실패를 공통 오류 타입으로 변환한다.
    const rejectScriptLoad = (event?: Event) => {
      cleanup();
      script.setAttribute(SCRIPT_STATUS_ATTRIBUTE, "error");
      scriptLoadingPromise = null;
      reject(
        createKakaoPostcodeError(
          "script_load_error",
          "Failed to load the Kakao Postcode script.",
          event,
        ),
      );
    };

    const scriptStatus = script.getAttribute(SCRIPT_STATUS_ATTRIBUTE);

    // 이미 성공 처리된 script라면 곧바로 생성자를 확인한다.
    if (scriptStatus === "loaded") {
      resolvePostcodeConstructor();
      return;
    }

    // 이전 실패 상태가 기록된 경우 즉시 실패로 반환한다.
    if (scriptStatus === "error") {
      rejectScriptLoad();
      return;
    }

    if (!reused) {
      script.setAttribute(SCRIPT_STATUS_ATTRIBUTE, "loading");
    }
    script.addEventListener("load", resolvePostcodeConstructor, { once: true });
    script.addEventListener("error", rejectScriptLoad, { once: true });

    // A reused third-party script tag may already be finished and never emit another event.
    // 일정 시간 안에 전역 생성자가 확인되지 않으면 재사용 실패로 판단한다.
    if (reused && scriptStatus === null) {
      timeoutId = window.setTimeout(() => {
        scriptLoadingPromise = null;
        reject(
          createKakaoPostcodeError(
            "postcode_unavailable",
            "Kakao Postcode constructor was not found from the existing script element.",
          ),
        );
      }, REUSED_SCRIPT_TIMEOUT_MS);
    }
  });

/**
 * Loads the Kakao postcode constructor from the browser DOM.
 *
 * Reuses a matching script tag instead of appending duplicates, and shares one in-flight promise
 * across concurrent callers. If the matching tag is already marked with
 * `data-kakao-postcode-status="error"`, the next load attempt removes it before creating a fresh
 * replacement script element.
 */
export const loadKakaoPostcodeScript = async (): Promise<KakaoPostcodeConstructor> => {
  // 브라우저 외 환경에서는 DOM 기반 스크립트 로딩이 불가능하다.
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw createKakaoPostcodeError(
      "browser_only",
      "Kakao Postcode script can only be loaded in a browser environment.",
    );
  }

  const existingConstructor = getPostcodeConstructor();

  // 이미 전역 생성자가 준비되어 있다면 즉시 반환한다.
  if (existingConstructor) {
    return existingConstructor;
  }

  // 현재 진행 중인 로드가 있다면 같은 Promise를 재사용한다.
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  const { script, reused } = getOrCreateScript();

  scriptLoadingPromise = createScriptLoadPromise(script, reused);

  return scriptLoadingPromise;
};

export const __resetKakaoPostcodeScriptLoaderForTests = (): void => {
  // 테스트 간 전역 로딩 상태를 초기화하기 위한 내부 전용 헬퍼다.
  scriptLoadingPromise = null;
};

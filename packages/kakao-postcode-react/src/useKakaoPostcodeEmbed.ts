import { useCallback, useEffect, useRef, useState } from "react";

import { createKakaoPostcodeError } from "./createKakaoPostcodeError";
import { loadKakaoPostcodeScript } from "./loadKakaoPostcodeScript";
import { normalizeKakaoPostcodeResult } from "./normalizeKakaoPostcodeResult";
import type {
  KakaoPostcodeCloseState,
  KakaoPostcodeCompleteEvent,
  KakaoPostcodeEmbedBaseOptions,
  KakaoPostcodeEmbedOptions,
  KakaoPostcodeEmbedStatus,
  KakaoPostcodeError,
  KakaoPostcodeInstance,
  KakaoPostcodeRawResult,
  KakaoPostcodeSize,
} from "./types";

// 훅이 외부로 노출하는 최소 제어 인터페이스다.
// 렌더 대상 ref와 상태, 오류, 제어 메서드를 함께 반환한다.
type UseKakaoPostcodeEmbedResult = {
  containerRef: (element: HTMLDivElement | null) => void;
  status: KakaoPostcodeEmbedStatus;
  error: KakaoPostcodeError | null;
  close: () => void;
  reload: () => void;
};

// 카카오 우편번호 임베드의 전체 생명주기를 관리하는 React 훅이다.
// 스크립트 로드, 인스턴스 생성, 이벤트 연결, 닫기/재시도까지 모두 담당한다.
export const useKakaoPostcodeEmbed = (
  options: KakaoPostcodeEmbedBaseOptions = {},
): UseKakaoPostcodeEmbedResult => {
  const {
    animation,
    autoClose,
    focusInput,
    height,
    hideEngBtn,
    hideMapBtn,
    maxSuggestItems,
    onClose,
    onComplete,
    onResize,
    pleaseReadGuide,
    q,
    shorthand,
    submitMode,
    theme,
    useBannerLink,
    width,
  } = options;
  const [status, setStatus] = useState<KakaoPostcodeEmbedStatus>("idle");
  const [error, setError] = useState<KakaoPostcodeError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  // 실제 DOM 노드와 생성된 Postcode 인스턴스는 ref로 유지한다.
  const containerRefValue = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<KakaoPostcodeInstance | null>(null);
  const onCloseRef = useRef<typeof onClose>(onClose);
  const onCompleteRef = useRef<typeof onComplete>(onComplete);
  const onResizeRef = useRef<typeof onResize>(onResize);

  // 서로 다른 비동기 로드 요청이 경쟁하지 않도록 요청 ID를 증가시키며 관리한다.
  const activeRequestIdRef = useRef(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const close = useCallback(() => {
    // 현재 진행 중인 콜백들을 모두 무효화한다.
    activeRequestIdRef.current += 1;

    if (containerRefValue.current) {
      // 카카오 스크립트가 삽입한 DOM을 비워 다음 임베드를 위한 초기 상태로 되돌린다.
      containerRefValue.current.innerHTML = "";
    }

    instanceRef.current = null;
    setError(null);
    setStatus("closed");
  }, []);

  const reload = useCallback(() => {
    close();
    setError(null);
    setReloadToken((value) => value + 1);
  }, [close]);

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    containerRefValue.current = element;
    setContainer((current) => {
      // 동일한 노드가 다시 들어오면 상태 갱신을 생략한다.
      if (current === element) {
        return current;
      }

      return element;
    });
  }, []);

  useEffect(() => {
    if (container) {
      return;
    }

    // 컨테이너가 사라졌다면 현재 인스턴스도 더 이상 사용할 수 없다.
    instanceRef.current = null;
    setStatus("idle");
  }, [container]);

  useEffect(() => {
    if (!container) {
      return;
    }

    // reload()는 옵션 변화가 없어도 이 effect를 다시 실행시키기 위한 수동 신호다.
    void reloadToken;

    let cancelled = false;
    const requestId = activeRequestIdRef.current + 1;

    // 이번 effect 실행에 대응하는 고유 요청 ID를 고정한다.
    activeRequestIdRef.current = requestId;

    const embed = async () => {
      setStatus("loading-script");
      setError(null);

      try {
        const Postcode = await loadKakaoPostcodeScript();

        // 언마운트되었거나 더 최신 요청이 있다면 이후 처리를 중단한다.
        if (cancelled || activeRequestIdRef.current !== requestId) {
          return;
        }

        setStatus("ready");

        // 생성 시점의 최신 옵션으로 Postcode 인스턴스를 만든다.
        const postcode = new Postcode({
          animation,
          focusInput,
          height,
          hideEngBtn,
          hideMapBtn,
          maxSuggestItems,
          onclose: (state: KakaoPostcodeCloseState) => {
            if (activeRequestIdRef.current !== requestId) {
              return;
            }

            // 닫힘 이벤트가 오면 현재 인스턴스를 정리하고 외부 콜백을 호출한다.
            activeRequestIdRef.current += 1;
            instanceRef.current = null;
            container.innerHTML = "";
            onCloseRef.current?.(state);
            setStatus("closed");
          },
          oncomplete: (raw: KakaoPostcodeRawResult) => {
            // 소비자가 원본 데이터와 정규화 데이터를 모두 활용할 수 있도록 함께 전달한다.
            const event: KakaoPostcodeCompleteEvent = {
              raw,
              normalized: normalizeKakaoPostcodeResult(raw),
            };

            if (activeRequestIdRef.current !== requestId) {
              return;
            }

            onCompleteRef.current?.(event);
          },
          onresize: (size: KakaoPostcodeSize) => {
            if (activeRequestIdRef.current !== requestId) {
              return;
            }

            onResizeRef.current?.(size);
          },
          pleaseReadGuide,
          shorthand,
          submitMode,
          theme,
          useBannerLink,
          width,
        });

        instanceRef.current = postcode;
        container.innerHTML = "";
        setStatus("embedding");

        // embed 메서드 2번째 인자로 허용되는 값만 선별해 전달한다.
        const embedOptions: KakaoPostcodeEmbedOptions = {};

        if (q !== undefined) {
          embedOptions.q = q;
        }

        if (autoClose !== undefined) {
          embedOptions.autoClose = autoClose;
        }

        if (Object.keys(embedOptions).length === 0) {
          postcode.embed(container);
        } else {
          postcode.embed(container, embedOptions);
        }

        // 실제 임베드가 완료된 뒤에만 open 상태를 노출한다.
        if (activeRequestIdRef.current === requestId) {
          setStatus("open");
        }
      } catch (cause) {
        if (cancelled || activeRequestIdRef.current !== requestId) {
          return;
        }

        // 이미 분류된 라이브러리 오류는 그대로 쓰고, 그 외 예외는 공통 오류 타입으로 감싼다.
        const nextError =
          cause instanceof Error && "code" in cause
            ? (cause as KakaoPostcodeError)
            : createKakaoPostcodeError(
                "embed_failed",
                "Failed to initialize Kakao Postcode embed.",
                cause,
              );

        setError(nextError);
        setStatus("error");
      }
    };

    void embed();

    return () => {
      // effect가 정리되면 이후 비동기 콜백이 상태를 건드리지 않도록 취소 플래그를 세운다.
      cancelled = true;
    };
  }, [
    animation,
    autoClose,
    container,
    focusInput,
    height,
    hideEngBtn,
    hideMapBtn,
    maxSuggestItems,
    pleaseReadGuide,
    q,
    reloadToken,
    shorthand,
    submitMode,
    theme,
    useBannerLink,
    width,
  ]);

  return {
    containerRef,
    status,
    error,
    close,
    reload,
  };
};

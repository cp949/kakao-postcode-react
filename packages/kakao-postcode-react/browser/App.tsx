import { useEffect, useMemo, useRef, useState } from "react";

import { loadKakaoPostcodeScript, useKakaoPostcodeEmbed } from "@pkg/index";

const KAKAO_POSTCODE_SCRIPT_URL =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type KakaoMockState = {
  constructorCount: number;
  embedCount: number;
  loadCount: number;
  lastHeight: number | string | null;
  lastQuery: string | null;
  lastAutoClose: boolean | null;
};

declare global {
  interface Window {
    __kakaoMockState?: KakaoMockState;
  }
}

const defaultMockState = (): KakaoMockState => ({
  constructorCount: 0,
  embedCount: 0,
  loadCount: 0,
  lastHeight: null,
  lastQuery: null,
  lastAutoClose: null,
});

const readMockState = (): KakaoMockState => window.__kakaoMockState ?? defaultMockState();

const countKakaoScripts = (): number =>
  document.querySelectorAll(`script[src="${KAKAO_POSTCODE_SCRIPT_URL}"]`).length;

const useMockMetrics = () => {
  const [mockState, setMockState] = useState<KakaoMockState>(() => readMockState());
  const [scriptCount, setScriptCount] = useState<number>(() => countKakaoScripts());

  useEffect(() => {
    const sync = () => {
      setMockState(readMockState());
      setScriptCount(countKakaoScripts());
    };

    sync();
    window.addEventListener("__kakao_mock_update", sync);

    return () => {
      window.removeEventListener("__kakao_mock_update", sync);
    };
  }, []);

  return {
    mockState,
    scriptCount,
  };
};

const HookFixture = ({
  q,
  autoClose,
}: {
  q?: string;
  autoClose?: boolean;
}) => {
  const [renderCount, setRenderCount] = useState(0);
  const { containerRef, status, error, reload } = useKakaoPostcodeEmbed({
    height: 480,
    q,
    autoClose,
  });
  const { mockState, scriptCount } = useMockMetrics();

  return (
    <main>
      <button data-testid="rerender" type="button" onClick={() => setRenderCount((value) => value + 1)}>
        rerender
      </button>
      <button data-testid="reload" type="button" onClick={reload}>
        reload
      </button>
      <div data-testid="status">{status}</div>
      <div data-testid="error">{error?.code ?? "none"}</div>
      <div data-testid="render-count">{renderCount}</div>
      <div data-testid="script-count">{scriptCount}</div>
      <div data-testid="load-count">{mockState.loadCount}</div>
      <div data-testid="constructor-count">{mockState.constructorCount}</div>
      <div data-testid="embed-count">{mockState.embedCount}</div>
      <div data-testid="last-height">{String(mockState.lastHeight ?? "null")}</div>
      <div data-testid="last-query">{mockState.lastQuery ?? "null"}</div>
      <div data-testid="last-auto-close">{String(mockState.lastAutoClose ?? "null")}</div>
      <div data-testid="embed-container" ref={containerRef} />
    </main>
  );
};

const LoaderFixture = ({ preloadScript }: { preloadScript: boolean }) => {
  const { mockState, scriptCount } = useMockMetrics();
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("none");
  const hasPreloadedScriptRef = useRef(false);

  useEffect(() => {
    if (!preloadScript || hasPreloadedScriptRef.current) {
      return;
    }

    hasPreloadedScriptRef.current = true;

    const script = document.createElement("script");
    script.src = KAKAO_POSTCODE_SCRIPT_URL;
    document.head.append(script);
  }, [preloadScript]);

  const loadConcurrently = async () => {
    setPhase("loading");
    setError("none");

    try {
      await Promise.all([loadKakaoPostcodeScript(), loadKakaoPostcodeScript()]);
      setPhase("loaded");
    } catch (cause) {
      setPhase("error");
      setError(cause instanceof Error ? cause.message : "unknown");
    }
  };

  return (
    <main>
      <button data-testid="load-concurrently" type="button" onClick={() => void loadConcurrently()}>
        load
      </button>
      <div data-testid="phase">{phase}</div>
      <div data-testid="loader-error">{error}</div>
      <div data-testid="script-count">{scriptCount}</div>
      <div data-testid="load-count">{mockState.loadCount}</div>
      <div data-testid="constructor-count">{mockState.constructorCount}</div>
    </main>
  );
};

export const App = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const mode = params.get("mode") ?? "hook";

  if (mode === "loader") {
    return <LoaderFixture preloadScript={false} />;
  }

  if (mode === "loader-preloaded") {
    return <LoaderFixture preloadScript={true} />;
  }

  if (mode === "hook-options") {
    return <HookFixture q="판교역" autoClose={false} />;
  }

  return <HookFixture />;
};

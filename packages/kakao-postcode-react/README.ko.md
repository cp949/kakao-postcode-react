# @cp949/kakao-postcode-react

[English](./README.md)

최소한의 컴포넌트, 더 낮은 수준의 훅, 스크립트 로더, 결과 정규화 유틸리티를 제공하는 Kakao Postcode `embed()`용 React 래퍼입니다.

## 설치

```bash
pnpm add @cp949/kakao-postcode-react
```

개발, CI, 패키지 설치에는 Node 20+를 사용하세요. 이는 브라우저 런타임 요구사항을 바꾸지는 않습니다. 이 패키지는 여전히 브라우저에서 동작하며 Kakao 우편번호 스크립트를 클라이언트 측에서 로드합니다.

피어 의존성:

- `react`
- `react-dom`

호환성 검증 범위:

- React `18.3.x`에서 테스트됨
- React `19.x`에서 테스트됨

## 현재 패키지 표면

- `KakaoPostcodeEmbed`
- `useKakaoPostcodeEmbed`
- `loadKakaoPostcodeScript`
- `normalizeKakaoPostcodeResult`

이 첫 번째 사용 가능한 버전은 의도적으로 `embed()`에 집중합니다. `open()` 같은 팝업 API는 현재 범위에 포함하지 않습니다.

## 기본 컴포넌트 사용 예시

```tsx
import { KakaoPostcodeEmbed } from "@cp949/kakao-postcode-react";

export function AddressSearch() {
  return (
    <KakaoPostcodeEmbed
      height={420}
      q="판교역"
      onComplete={({ raw, normalized }) => {
        console.log(raw.zonecode);
        console.log(normalized.fullRoadAddress);
      }}
    />
  );
}
```

## 기본 훅 사용 예시

```tsx
import { useKakaoPostcodeEmbed } from "@cp949/kakao-postcode-react";

export function AddressSearchPanel() {
  const { containerRef, status, error, close, reload } = useKakaoPostcodeEmbed({
    q: "판교역",
    autoClose: false,
    onComplete: ({ normalized }) => {
      console.log(normalized);
    },
  });

  return (
    <section>
      {status === "loading-script" ? <p>Loading...</p> : null}
      {status === "error" ? <p>{error?.message}</p> : null}
      <div ref={containerRef} style={{ height: 420 }} />
      <button type="button" onClick={reload}>
        Reload
      </button>
      <button type="button" onClick={close}>
        Close
      </button>
    </section>
  );
}
```

## `embed()` 옵션 메모

- `q`는 Kakao `embed()`의 초기 검색어를 설정합니다.
- `autoClose`는 iframe 모드에서 지원되며 Kakao `embed()` 옵션으로 전달됩니다.
- 이 패키지에서는 `autoClose`를 Kakao constructor 옵션으로 전달하지 않습니다.

## 결과 형태

`onComplete`는 공식 Kakao 응답과 정규화된 헬퍼 모델을 함께 반환합니다.

```ts
type KakaoPostcodeCompleteEvent = {
  raw: KakaoPostcodeRawResult;
  normalized: KakaoPostcodeNormalizedResult;
};
```

`normalized`에는 다음과 같은 필드가 포함됩니다.

- `extraAddress`
- `fullRoadAddress`
- `fullJibunAddress`
- `isRoadAddress`
- `isJibunAddress`

## SSR 및 런타임 메모

- 이 패키지는 브라우저 전용입니다. 클라이언트에서 로드하고 렌더링하세요.
- 라이브러리는 Kakao가 호스팅하는 우편번호 스크립트에 의존하며 이를 번들에 포함하지 않습니다.
- 현재 스크립트 URL은 Kakao 공식 CDN인 `https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js`를 사용합니다.
- Kakao API는 브라우저 전역 API이므로 훅과 컴포넌트는 서버 렌더링 중 실행하면 안 됩니다.
- 동일한 Kakao 스크립트 태그가 이미 실패 상태로 표시되어 있으면, 로더는 실패한 태그를 제거하고 다음 로드 시도에서 새 스크립트 엘리먼트로 다시 시도합니다.
- 배포된 패키지는 ESM/CJS 번들러 소비자를 대상으로 합니다. UMD 빌드를 브라우저에서 직접 사용할 경우 먼저 `React` 전역 객체를 제공하세요.

## 운영 가이드

- `height`, `width`, `theme`처럼 Kakao embed에 영향을 주는 옵션이 바뀌면, 라이브 iframe에 최신 설정이 반영되도록 re-embed가 발생합니다.
- 콜백만 바뀌는 업데이트는 re-embed를 일으키지 않습니다. `onComplete`, `onResize`, `onClose`를 변경해도 현재 embed 인스턴스는 유지됩니다.
- React Strict Mode에서는 개발 환경에서 effect가 추가로 mount/cleanup될 수 있습니다. 이 훅은 그런 동작을 개발 중에도 견디도록 설계되어 있습니다.
- 이전에 실패한 Kakao 스크립트 태그가 있더라도 로더의 재시도 경로가 자동으로 동작하므로, 다음 로드 시도는 수동 DOM 정리 없이 복구할 수 있습니다.
- 패키지가 Kakao의 호스팅 스크립트 URL에 의존하므로, CSP 정책의 `script-src`에 `https://t1.kakaocdn.net` 허용이 필요할 수 있습니다.

## 설계 메모

- 공식 Kakao 사실과 패키지 차원의 설계 결정은 저장소 문서에서 의도적으로 분리합니다.
- 기본 컴포넌트는 소비자가 스타일을 자유롭게 덮어쓸 수 있도록 UI를 최소화합니다.
- 생명주기나 레이아웃을 더 엄격하게 제어해야 한다면 `useKakaoPostcodeEmbed`를 직접 사용하세요.

## 개발 검증

- `pnpm --filter @cp949/kakao-postcode-react test`
- `pnpm --filter @cp949/kakao-postcode-react build`
- `pnpm --filter @cp949/kakao-postcode-react test:artifacts`
- `pnpm test:browser`
- `pnpm smoke:react18`
- `pnpm smoke:react19`

기본 패키지 테스트 명령은 소스 기준 검사만 수행하며, 미리 빌드된 `dist/` 디렉터리를 요구하지 않습니다. 출력된 패키지 파일까지 확인하고 싶다면 `build` 후 `test:artifacts`를 실행하세요.

React 18과 React 19 스모크 명령은 packed tarball을 임시 consumer에 설치한 뒤, 컴포넌트와 훅 API 모두에 대해 가벼운 `jsdom` 렌더 검사를 수행합니다. 여기에는 커스텀 fallback 렌더링과 훅의 `q`/`autoClose` `embed()` 옵션 검증도 포함됩니다.

## 배포

실제 배포 전에 npm 로그인 상태와 패키지 산출물을 먼저 확인하세요.

```bash
npm whoami
pnpm --filter @cp949/kakao-postcode-react build
pnpm --filter @cp949/kakao-postcode-react pack
```

packed 결과가 정상이면 저장소 루트에서 배포할 수 있습니다.

```bash
pnpm release
```

이 패키지만 직접 배포하려면 아래 명령을 사용하세요.

```bash
pnpm --filter @cp949/kakao-postcode-react run release
```

이미 `1.0.0` 버전이 배포되어 있다면, 다시 배포하기 전에 `packages/kakao-postcode-react/package.json`의 버전을 올려야 합니다.

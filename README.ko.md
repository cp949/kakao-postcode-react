# kakao-postcode-react

[English](./README.md)

이 저장소는 배포되는 `@cp949/kakao-postcode-react` 패키지를 관리하는 모노레포입니다.

npm에 배포되는 실제 패키지는 `packages/kakao-postcode-react`에 있습니다.

## 어디를 읽어야 하나요

- 패키지 사용법, API 표면, SSR 주의사항, 예제: [`packages/kakao-postcode-react/README.ko.md`](./packages/kakao-postcode-react/README.ko.md)
- 패키지 소스: [`packages/kakao-postcode-react/src`](./packages/kakao-postcode-react/src)
- 로컬 데모 앱: [`apps/demo`](./apps/demo)
- 패키지 브라우저 테스트 하네스: [`packages/kakao-postcode-react/browser`](./packages/kakao-postcode-react/browser)
- 계획 문서와 구현 메모: [`docs/plans`](./docs/plans)

## 워크스페이스 구조

```text
.
|-- apps/
|   `-- demo/
|-- docs/
|   `-- plans/
|-- packages/
|   |-- kakao-postcode-react/
|   `-- typescript-config/
|-- README.md
`-- README.ko.md
```

## 패키지 요약

`@cp949/kakao-postcode-react`는 Kakao Postcode `embed()`를 감싼 브라우저 전용 React 래퍼입니다.

현재 제공하는 표면은 다음과 같습니다.

- `KakaoPostcodeEmbed`
- `useKakaoPostcodeEmbed`
- `loadKakaoPostcodeScript`
- `normalizeKakaoPostcodeResult`

설치 방법과 최종 사용자 예제는 패키지 README를 참고하세요.

- [`packages/kakao-postcode-react/README.ko.md`](./packages/kakao-postcode-react/README.ko.md)

## 개발

워크스페이스 의존성을 설치합니다.

```bash
pnpm install
```

로컬 데모 앱을 실행합니다.

```bash
pnpm dev
```

유용한 명령어:

```bash
pnpm demo:dev
pnpm demo:build
pnpm --filter @cp949/kakao-postcode-react test
pnpm --filter @cp949/kakao-postcode-react build
pnpm --filter @cp949/kakao-postcode-react test:artifacts
pnpm test:browser
pnpm smoke:react18
pnpm smoke:react19
```

개발, CI, 패키지 설치에는 `Node.js` 20 이상을 사용하세요.

## 문서 역할 분리

이 저장소는 패키지 소비자용 문서는 패키지 README에 두고, 저장소 운영과 기여 관련 안내는 루트 README에 둡니다.

원칙은 다음과 같습니다.

- API, 설치, 사용법, SSR, 런타임 동작 변경은 `packages/kakao-postcode-react/README.ko.md`를 업데이트
- 워크스페이스 구조, 개발 명령, 문서 탐색, 기여자 안내는 `README.ko.md`를 업데이트

## 공통 런타임 메모

아래 메모는 로컬 개발 중 검증하기 쉽고 패키지 README와의 일관성도 확인하고 있어 루트 README에 함께 둡니다.

`embed()` 옵션 관련 메모:

- `q`는 Kakao `embed()`의 초기 검색어를 설정합니다.
- `autoClose`는 iframe 모드에서 지원되며 Kakao `embed()` 옵션으로 전달됩니다.
- 이 패키지에서는 `autoClose`를 Kakao constructor 옵션으로 전달하지 않습니다.

로더 복구 메모:

- 동일한 Kakao 스크립트 태그가 이미 에러 상태로 표시되어 있으면, 로더는 실패한 태그를 제거하고 다음 로드 시도에서 새 스크립트 엘리먼트로 다시 시도합니다.

## 로컬 데모

워크스페이스 데모 앱은 패키지의 주 문서라기보다 저장소 차원의 검증 도구에 가깝습니다.

```bash
pnpm dev
pnpm demo:dev
pnpm demo:build
```

현재 앱은 하나의 `Dialog 예제`에 집중합니다. 호출자에서 주소 검색을 열고, 주소를 선택하고, 결과를 `호출자에게 반환`한 뒤, 같은 화면에서 `핵심 코드`를 확인할 수 있습니다.

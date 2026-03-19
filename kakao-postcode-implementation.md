# Kakao Postcode 구현 정리

기준일: 2026-03-19

이 문서는 Kakao 우편번호 서비스를 React 컴포넌트로 감싸기 전에,
공식 가이드 기준으로 현재 구현 방식이 어떻게 되어 있는지 정리한 문서다.

## 한눈에 보는 결론

- 공식 구현 방식은 외부 스크립트 로딩 후 `new kakao.Postcode(...)`를 호출하는 브라우저 JS API 방식이다.
- 현재 공식 가이드는 `https://postcode.map.kakao.com/guide` 이고, 기본 스크립트 URL은 `//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js` 이다.
- 별도 앱 키 발급 없이 사용할 수 있고, 사용량 제한 없이 무료라고 안내되어 있다.
- 공식적으로 Node 모듈이나 TypeScript 패키지를 제공하지 않는다.
- React 라이브러리로 만들 때는 "스크립트 로더 + 브라우저 전역 객체 래퍼 + popup/embed 컴포넌트" 구조가 가장 자연스럽다.

## 공식 자료에서 확인한 사실

### 1. 진입점과 기본 사용법

공식 가이드는 다음 위치에 있다.

- Guide: https://postcode.map.kakao.com/guide

가이드의 기본 예제는 아래 흐름을 사용한다.

1. 페이지에 외부 스크립트를 로드한다.
2. `new kakao.Postcode({ oncomplete })` 인스턴스를 만든다.
3. `open()` 또는 `embed(element)` 를 호출한다.

가이드 기준 기본 스크립트:

```html
<script src="//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
```

중요한 점:

- 현재 공식 문서의 전역 객체 이름은 `kakao.Postcode` 이다.
- 예전 자료나 블로그에는 `daum.Postcode` 가 남아 있을 수 있지만, 최신 가이드는 `kakao.Postcode` 를 사용한다.

### 2. 사용 정책과 제약

공식 가이드와 공식 Q&A에서 확인되는 핵심 제약은 다음과 같다.

- 앱 키가 필요하지 않다.
- 사용량 제한이 없다고 안내한다.
- 상업적 사용도 무료라고 안내한다.
- 하단 로고를 임의로 가리면 사용 제약이 생길 수 있다.
- 스크립트를 임의 수정하면 사용 제약이 생길 수 있다.
- 인터넷 연결이 필요한 서비스이며, 인트라넷은 공식 지원 대상이 아니다.
- 정적 `file://` 실행 환경이 아니라 웹서버 환경에서 사용해야 한다.
- 공식적으로 REST API, Node 모듈, TypeScript 모듈을 제공하지 않는다.

관련 자료:

- Guide: https://postcode.map.kakao.com/guide
- Q&A: https://github.com/daumPostcode/QnA

### 3. 팝업 방식과 iframe 임베드 방식

공식 API는 두 가지 호출 방식을 제공한다.

- `open()`
  - 새 팝업 창으로 연다.
  - `q`, `left`, `top`, `popupTitle`, `popupKey`, `autoClose` 등을 줄 수 있다.
- `embed(element, options)`
  - 지정한 DOM 요소 안에 iframe 형태로 삽입한다.
  - 모바일 웹이나 WebView에서는 이쪽이 더 안정적이라는 공식 안내가 있다.

실무적으로는 이렇게 보는 게 좋다.

- 일반 웹: `open()` 이 구현이 단순하다.
- 모바일 웹, WebView, 커스텀 브라우저 대응: `embed()` 가 더 안전하다.

### 4. 주요 콜백과 데이터

가이드상 핵심 콜백은 아래 세 가지다.

- `oncomplete(data)`
  - 사용자가 주소를 선택했을 때 호출된다.
- `onresize(size)`
  - 임베드 모드에서 화면 높이를 맞출 때 유용하다.
- `onclose(state)`
  - 창이 닫힌 시점을 받을 수 있다.

실제 라이브러리에서 가장 중요한 데이터는 보통 아래 항목들이다.

- `zonecode`
- `address`
- `addressType`
- `userSelectedType`
- `roadAddress`
- `jibunAddress`
- `englishAddress`
- `bname`
- `buildingName`
- `apartment`
- `autoRoadAddress`
- `autoJibunAddress`

실무에서 특히 중요한 포인트:

- 사용자가 도로명 주소를 골랐는지 지번 주소를 골랐는지는 `userSelectedType` 으로 분기한다.
- 사용자가 "선택 안함" 흐름으로 빠졌을 때는 `autoRoadAddress`, `autoJibunAddress` 를 함께 보는 게 좋다.
- 참고항목은 `bname`, `buildingName`, `apartment` 를 조합해서 만드는 방식이 공식 예제에 가깝다.

### 5. 화면 옵션

가이드에서 React 래퍼에 그대로 노출하기 좋은 옵션들:

- `width`
- `height`
- `minWidth`
- `maxSuggestItems`
- `animation`
- `focusInput`
- `shorthand`
- `pleaseReadGuide`
- `hideMapBtn`
- `hideEngBtn`
- `alwaysShowEngAddr`
- `submitMode`
- `useBannerLink`
- `theme`

이 중 라이브러리 1차 버전에서 특히 가치가 큰 옵션은 아래다.

- `theme`
- `animation`
- `hideMapBtn`
- `hideEngBtn`
- `autoClose`
- `width` / `height`

## React에서 어떻게 구현하는 게 좋은가

이 섹션은 공식 JS API를 바탕으로 한 구현 권장안이다. 즉, 아래 내용은 공식 문서의 직접 표현이 아니라 React 라이브러리 설계에 대한 추론이다.

### 권장 구조

1. `loadKakaoPostcodeScript()`
   - 브라우저에서만 실행
   - 중복 로드 방지
   - 로드 완료 Promise 캐시

2. `useKakaoPostcodeEmbed()`
   - 스크립트 로드
   - `embed(element)` 라이프사이클 래핑
   - 전역 객체 존재 여부 검사

3. `KakaoPostcodeEmbed`
   - 마운트 시 `embed(ref.current, options)`
   - `onresize` 로 컨테이너 높이 동기화

4. 타입 정의
   - `PostcodeAddress`
   - `PostcodeEmbedOptions`
   - `Theme`

이 구조가 좋은 이유:

- 공식 API가 브라우저 전역 객체 중심이라 React 훅/컴포넌트로 감싸기 쉽다.
- SSR 환경에서 안전장치를 두기 좋다.
- 추후 popup 지원을 추가할 여지는 남기면서도 1차 범위를 `embed()` 에 집중할 수 있다.
- 추후 `next/dynamic` 또는 client component 환경에 대응하기 쉽다.

## React 구현 시 주의할 점

### 1. SSR 대응

이 API는 브라우저 전역 객체와 DOM을 필요로 하므로 서버에서 직접 실행하면 안 된다.

권장 방식:

- `typeof window !== "undefined"` 체크 후 로드
- 컴포넌트는 client-side 에서만 동작
- Next.js 라면 client component 또는 dynamic import 사용

### 2. 스크립트 중복 삽입 방지

여러 컴포넌트가 동시에 렌더링될 수 있으므로 스크립트 로더는 Promise 싱글톤으로 두는 편이 좋다.

### 3. 모바일과 WebView

공식 Q&A는 기본 WebView 에서 `open()` 보다는 `embed()` 사용을 권장한다.
따라서 1차 React 래퍼 범위를 `embed()` 에 맞추는 판단은 충분히 합리적이다.

### 4. 주소 조합 로직은 라이브러리에서 과도하게 강제하지 않기

공식 예제는 `bname`, `buildingName`, `apartment` 를 조합해 참고항목을 만드는 예시를 제공한다.
하지만 서비스마다 주소 표시 규칙이 다를 수 있으므로,
라이브러리는 원본 데이터를 충분히 넘기고 조합 유틸을 선택적으로 제공하는 편이 좋다.

## 권장 API 초안

아래는 React 패키지에서 무난한 공개 API 예시다.

```ts
export type KakaoPostcodeResult = {
  zonecode: string;
  address: string;
  addressType: "R" | "J";
  userSelectedType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  bname: string;
  buildingName: string;
  apartment: "Y" | "N";
  autoRoadAddress: string;
  autoJibunAddress: string;
};

export type KakaoPostcodeCompleteEvent = {
  raw: KakaoPostcodeRawResult;
  normalized: KakaoPostcodeNormalizedResult;
};
```

컴포넌트 레벨에서는 다음 정도가 현실적이다.

- `<KakaoPostcodeEmbed />`
- `useKakaoPostcodeEmbed()`
- `loadKakaoPostcodeScript()`
- `normalizeKakaoPostcodeResult()`

## 구현 우선순위 제안

패키지 초기 버전은 아래 순서가 가장 안정적이다.

1. 스크립트 로더
2. 타입 정의
3. 주소 조합 유틸
4. `useKakaoPostcodeEmbed()`
5. 임베드형 컴포넌트

이유:

- 타입과 로더가 먼저 안정되어야 나머지 컴포넌트가 단순해진다.
- 임베드형은 높이 조절과 닫기 UX를 더 신경 써야 한다.
- 1차 공개 범위를 `embed()` 로 좁히면 API와 문서 품질을 빠르게 안정화할 수 있다.

## 공식 자료 링크

- 공식 가이드: https://postcode.map.kakao.com/guide
- 공식 Q&A 저장소: https://github.com/daumPostcode/QnA

## 기준일 메모

2026-03-19 기준 공개 가이드에서 확인한 내용으로 정리했다.
향후 바뀔 가능성이 높은 부분은 아래다.

- CDN 경로
- 전역 객체 명칭 관련 안내
- 옵션 목록
- 브라우저/WebView 지원 범위
- 패치 노트 위치

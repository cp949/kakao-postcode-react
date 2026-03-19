# @cp949/kakao-postcode-react

[한국어](./README.ko.md)

React wrapper for Kakao Postcode `embed()` with a minimal component, a lower-level hook, a script loader, and a result normalizer.

### Install

```bash
pnpm add @cp949/kakao-postcode-react
```

Use Node 20+ for development, CI, and package installation. This does not change the browser runtime requirement: the package still runs in the browser and loads Kakao's postcode script client-side.

Peer dependencies:

- `react`
- `react-dom`

Compatibility coverage:

- Tested with React `18.3.x`
- Tested with React `19.x`

### Current Package Surface

- `KakaoPostcodeEmbed`
- `useKakaoPostcodeEmbed`
- `loadKakaoPostcodeScript`
- `normalizeKakaoPostcodeResult`

This first usable version is intentionally focused on `embed()`. Popup APIs such as `open()` are out of scope for now.

### Basic Component Usage

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

### Basic Hook Usage

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

### Embed Option Notes

- `q` sets Kakao's initial search query for `embed()`.
- `autoClose` is supported for iframe mode and is passed to Kakao's `embed()` options.
- In this package, `autoClose` is not forwarded through the Kakao constructor options.

### Result Shape

`onComplete` returns both the official Kakao payload and a normalized helper model:

```ts
type KakaoPostcodeCompleteEvent = {
  raw: KakaoPostcodeRawResult;
  normalized: KakaoPostcodeNormalizedResult;
};
```

`normalized` includes fields such as:

- `extraAddress`
- `fullRoadAddress`
- `fullJibunAddress`
- `isRoadAddress`
- `isJibunAddress`

### SSR And Runtime Notes

- This package is browser-only. Load and render it on the client.
- The library depends on Kakao's hosted postcode script and does not bundle it.
- The script URL currently targets Kakao's official CDN: `https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js`
- Kakao's API is a browser global API, so the hook/component should not run during server render.
- If a matching Kakao script tag is already marked as failed, the loader removes that tag and retries with a fresh script element on the next load attempt.
- The published package is aimed at ESM/CJS bundler consumers. If you use the UMD build directly in a browser, provide the `React` global first.

### Operational Guidance

- Option changes that affect the Kakao embed, such as `height`, `width`, and `theme`, trigger a re-embed so the live iframe reflects the latest settings.
- Callback-only updates do not trigger a re-embed. Updating `onComplete`, `onResize`, or `onClose` keeps the current embed instance mounted.
- In React Strict Mode, development-only effect replays can cause extra mount and cleanup cycles. The hook is intended to tolerate that behavior during development.
- The loader retry path is automatic for a previously failed Kakao script tag, so the next load attempt can recover without manual DOM cleanup.
- Because the package depends on Kakao's hosted script URL, your CSP policy may need to allow `https://t1.kakaocdn.net` in `script-src`.

### Design Notes

- Official Kakao facts and package design choices are intentionally separated in this repo's docs.
- The default component keeps UI minimal so consumers can override styling freely.
- If you need stricter control over lifecycle or layout, use `useKakaoPostcodeEmbed` directly.

### Development Verification

- `pnpm --filter @cp949/kakao-postcode-react test`
- `pnpm --filter @cp949/kakao-postcode-react build`
- `pnpm --filter @cp949/kakao-postcode-react test:artifacts`
- `pnpm test:browser`
- `pnpm smoke:react18`
- `pnpm smoke:react19`

The default package test command is source-only and does not require a prebuilt `dist/` directory. Run `test:artifacts` after `build` when you want to verify emitted package files.

The React 18 and React 19 smoke commands install the packed tarball into a temporary consumer and run a lightweight `jsdom` render check for both the component and hook APIs, including custom fallback rendering and hook `q`/`autoClose` embed options.

# kakao-postcode-react

[한국어](./README.ko.md)

This repository is the monorepo for the published `@cp949/kakao-postcode-react` package.

The npm package lives in `packages/kakao-postcode-react`.

### Where To Read What

- Package usage, API surface, SSR notes, and examples: [`packages/kakao-postcode-react/README.md`](./packages/kakao-postcode-react/README.md)
- Package source: [`packages/kakao-postcode-react/src`](./packages/kakao-postcode-react/src)
- Local demo app: [`apps/demo`](./apps/demo)
- Package browser test harness: [`packages/kakao-postcode-react/browser`](./packages/kakao-postcode-react/browser)
- Project plans and implementation notes: [`docs/plans`](./docs/plans)

### Workspace Layout

```text
.
|-- apps/
|   `-- demo/
|-- docs/
|   `-- plans/
|-- packages/
|   |-- kakao-postcode-react/
|   `-- typescript-config/
`-- README.md
```

### Package Summary

`@cp949/kakao-postcode-react` is a browser-only React wrapper around Kakao Postcode `embed()`.

Current package surface:

- `KakaoPostcodeEmbed`
- `useKakaoPostcodeEmbed`
- `loadKakaoPostcodeScript`
- `normalizeKakaoPostcodeResult`

For installation and end-user examples, use the package README:

- [`packages/kakao-postcode-react/README.md`](./packages/kakao-postcode-react/README.md)

### Development

Install workspace dependencies:

```bash
pnpm install
```

Start the local demo app:

```bash
pnpm dev
```

Useful commands:

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

Use `Node.js` 20 or newer for development, CI, and package installation.

### Documentation Ownership

This repository keeps package-consumer documentation in the package README and keeps repository-operational guidance in this root README.

As a rule:

- update `packages/kakao-postcode-react/README.md` for API, install, usage, SSR, and runtime behavior changes
- update `README.md` for workspace layout, development commands, docs navigation, and contributor-facing guidance

### Shared Runtime Notes

These short notes stay in the root README because they are easy to verify during local development and are also checked for consistency with the package README.

Embed option notes:

- `q` sets Kakao's initial search query for `embed()`.
- `autoClose` is supported for iframe mode and is passed to Kakao's `embed()` options.
- In this package, `autoClose` is not forwarded through the Kakao constructor options.

Loader recovery note:

- If a matching Kakao script tag is already marked with an error state, the loader removes that failed tag and retries with a fresh script element on the next load attempt.

### Local Demo

The workspace demo app is a repository-level verification tool rather than the package's main documentation surface.

```bash
pnpm dev
pnpm demo:dev
pnpm demo:build
```

The current app focuses on one `Dialog 예제`: open address search from a caller, select an address, confirm the result `호출자에게 반환`, and review the same screen's `핵심 코드`.

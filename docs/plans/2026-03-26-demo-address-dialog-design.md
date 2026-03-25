# Demo Address Dialog Design

**Context**

The demo app currently presents a branded address-search dialog with a custom title area, extra explanatory copy, and a wider `maxWidth="sm"` layout. The reference dialog at `/home/jjfive/p/ttmo/ttmo-web/sub/ui/src/dialogs/KoreaAddressSearchDialog/KoreaAddressSearchDialog.tsx` uses a much simpler composition: a standard MUI `Dialog`, a closeable title row, `DialogContent` with `dividers`, a fixed iframe height, and explicit `loadingFallback` / `errorFallback` handling.

**Approved Scope**

- Align the demo dialog UI and behavior with the reference dialog.
- Keep the surrounding showcase page and result card intact.
- Update the demo's code snippet so it reflects the actual dialog implementation.

**Approach Options**

1. Update only `AddressSearchDialog.tsx`.
   This gets the visible dialog close to the reference quickly, but leaves the example snippet stale.
2. Update `AddressSearchDialog.tsx` and `ExampleCodeCard.tsx`.
   This keeps the live demo and the instructional snippet aligned. This is the approved approach.
3. Rebuild the full demo page around the reference dialog pattern.
   This would expand the change beyond the dialog itself and is unnecessary for the current request.

**Design**

The demo dialog will mirror the reference structure with local MUI primitives:

- `Dialog` stays the container and switches to `fullWidth` plus `maxWidth="xs"`.
- The title area becomes a simple `DialogTitle` row with a text title and a close button, replacing the decorative stacked hero copy.
- `DialogContent` uses `dividers`, `p: 0`, and `minHeight` matching the embedded iframe height.
- `KakaoPostcodeEmbed` receives `q`, `autoClose`, `height`, `loadingFallback`, `errorFallback`, `onClose`, and `onComplete`, matching the reference behavior as closely as possible without external project dependencies.
- Provider close events return `undefined` only for non-complete close states; a successful completion still resolves through `onComplete`.

**Testing**

The existing workspace test that inspects demo source files will be extended first so it fails until the new structure exists. The assertions will cover the tighter dialog width, fallback props, provider close handling, and the synchronized code snippet text.

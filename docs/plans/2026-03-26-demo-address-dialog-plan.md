# Demo Address Dialog Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the demo address-search dialog UI and behavior with the reference Korea address dialog, while keeping the example code card synchronized with the live implementation.

**Architecture:** Keep the surrounding demo page unchanged and focus the implementation on the dialog component plus its instructional snippet. Use the existing workspace source-inspection test as the safety net, extending it first to describe the expected reference-aligned dialog structure before changing production code.

**Tech Stack:** React 19, TypeScript, MUI 7, Vitest, `@cp949/kakao-postcode-react`

---

### Task 1: Capture the new dialog contract in tests

**Files:**
- Modify: `packages/kakao-postcode-react/tests/workspaceDemoExamples.test.ts`
- Test: `packages/kakao-postcode-react/tests/workspaceDemoExamples.test.ts`

**Step 1: Write the failing test**

Add assertions that the dialog source contains:

- `fullWidth`
- `maxWidth="xs"`
- `loadingFallback`
- `errorFallback`
- `autoClose`
- `COMPLETE_CLOSE`
- `height={IFRAME_HEIGHT}`

Add assertions that the code example string contains the same dialog shape.

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @cp949/kakao-postcode-react exec vitest run tests/workspaceDemoExamples.test.ts`
Expected: FAIL because the current demo dialog and code snippet still use the older structure.

**Step 3: Commit**

```bash
git add packages/kakao-postcode-react/tests/workspaceDemoExamples.test.ts
git commit -m "test: capture demo dialog alignment expectations"
```

### Task 2: Implement the dialog alignment

**Files:**
- Modify: `apps/demo/src/components/AddressSearchDialog.tsx`

**Step 1: Write minimal implementation**

Refactor the dialog to:

- introduce `IFRAME_HEIGHT`
- use `Dialog` with `fullWidth` and `maxWidth="xs"`
- render a simple title row with close action
- use `DialogContent dividers sx={{ minHeight: IFRAME_HEIGHT, p: 0 }}`
- pass `q="판교역"`, `autoClose`, `height={IFRAME_HEIGHT}`, `width="100%"`, `style={{ width: "100%" }}`
- add `loadingFallback` and `errorFallback`
- map provider `onClose` so only non-complete closes trigger the external close callback

**Step 2: Run test to verify it passes**

Run: `pnpm --filter @cp949/kakao-postcode-react exec vitest run tests/workspaceDemoExamples.test.ts`
Expected: PASS for the dialog-source assertions after implementation.

**Step 3: Commit**

```bash
git add apps/demo/src/components/AddressSearchDialog.tsx
git commit -m "feat: align demo address dialog with reference UI"
```

### Task 3: Sync the example code card

**Files:**
- Modify: `apps/demo/src/components/ExampleCodeCard.tsx`

**Step 1: Write minimal implementation**

Update the embedded `exampleCode` string so it mirrors the new dialog structure, including `IFRAME_HEIGHT`, `fullWidth`, `maxWidth="xs"`, fallbacks, `autoClose`, and provider close handling.

**Step 2: Run test to verify it passes**

Run: `pnpm --filter @cp949/kakao-postcode-react exec vitest run tests/workspaceDemoExamples.test.ts`
Expected: PASS for both dialog and code-card assertions.

**Step 3: Commit**

```bash
git add apps/demo/src/components/ExampleCodeCard.tsx
git commit -m "docs: sync demo example code with dialog implementation"
```

### Task 4: Verify the demo still type-checks

**Files:**
- Verify: `apps/demo/src/components/AddressSearchDialog.tsx`
- Verify: `apps/demo/src/components/ExampleCodeCard.tsx`

**Step 1: Run targeted verification**

Run: `pnpm --filter demo check-types`
Expected: PASS with no TypeScript errors.

**Step 2: Optional build verification**

Run: `pnpm --filter demo build`
Expected: PASS if no unrelated environment issues exist.

**Step 3: Commit**

```bash
git add apps/demo/src/components/AddressSearchDialog.tsx apps/demo/src/components/ExampleCodeCard.tsx packages/kakao-postcode-react/tests/workspaceDemoExamples.test.ts docs/plans/2026-03-26-demo-address-dialog-design.md docs/plans/2026-03-26-demo-address-dialog-plan.md
git commit -m "feat: align demo address dialog UI"
```

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace demo examples", () => {
  it("shows one dialog example with a caller result summary and code snippet", () => {
    const dialogCardPath = path.resolve(
      __dirname,
      "../../../apps/demo/src/components/DialogExampleCard.tsx",
    );
    const dialogPath = path.resolve(
      __dirname,
      "../../../apps/demo/src/components/AddressSearchDialog.tsx",
    );
    const codeCardPath = path.resolve(
      __dirname,
      "../../../apps/demo/src/components/ExampleCodeCard.tsx",
    );
    const resultCardPath = path.resolve(
      __dirname,
      "../../../apps/demo/src/components/ExampleResultCard.tsx",
    );

    expect(fs.existsSync(dialogCardPath)).toBe(true);
    expect(fs.existsSync(dialogPath)).toBe(true);
    expect(fs.existsSync(codeCardPath)).toBe(true);
    expect(fs.existsSync(resultCardPath)).toBe(true);

    const dialogCardSource = fs.readFileSync(dialogCardPath, "utf8");
    const dialogSource = fs.readFileSync(dialogPath, "utf8");
    const codeCardSource = fs.readFileSync(codeCardPath, "utf8");
    const resultCardSource = fs.readFileSync(resultCardPath, "utf8");

    expect(dialogCardSource).toContain("AddressSearchDialog");
    expect(dialogCardSource).toContain("주소 검색 열기");
    expect(dialogCardSource).toContain("setOpen(false)");
    expect(dialogSource).toContain("Dialog");
    expect(dialogSource).toContain("DialogTitle");
    expect(dialogSource).toContain("DialogContent");
    expect(dialogSource).toContain("KakaoPostcodeEmbed");
    expect(dialogSource).toContain("onComplete");
    expect(dialogSource).toContain("주소를 선택하면");
    expect(codeCardSource).toContain("const exampleCode");
    expect(codeCardSource).toContain("Dialog");
    expect(codeCardSource).toContain("KakaoPostcodeEmbed");
    expect(resultCardSource).toContain("우편번호");
    expect(resultCardSource).toContain("기본 주소");
    expect(resultCardSource).toContain("정규화 주소");
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const getBuiltDistDir = () => {
  const distDir = path.resolve(__dirname, "../dist");

  expect(
    fs.existsSync(distDir),
    "Expected built dist artifacts. Run `pnpm --filter @cp949/kakao-postcode-react build` before `pnpm --filter @cp949/kakao-postcode-react test:artifacts`.",
  ).toBe(true);

  return distDir;
};

describe("dist artifacts", () => {
  it("emits the expected published files", () => {
    const distDir = getBuiltDistDir();
    const distFiles = fs.readdirSync(distDir).sort();

    expect(distFiles).toEqual(
      expect.arrayContaining([
        "index.d.ts",
        "index.es.js",
        "index.umd.cjs",
        "KakaoPostcodeEmbed.d.ts",
        "loadKakaoPostcodeScript.d.ts",
        "normalizeKakaoPostcodeResult.d.ts",
        "types.d.ts",
        "useKakaoPostcodeEmbed.d.ts",
      ]),
    );
  });

  it("keeps generated type declarations free of test artifacts", () => {
    const distDir = getBuiltDistDir();
    const declarationFiles = fs
      .readdirSync(distDir)
      .filter((fileName) => fileName.endsWith(".d.ts"));

    const declarationSource = declarationFiles
      .map((fileName) => fs.readFileSync(path.join(distDir, fileName), "utf8"))
      .join("\n");

    expect(declarationSource).not.toContain("__tests__");
    expect(declarationSource).not.toContain("vitest");
    expect(declarationSource).not.toContain("Testing Library");
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readBuiltArtifact = (fileName: string) => {
  const distPath = path.resolve(__dirname, "../dist", fileName);

  expect(
    fs.existsSync(distPath),
    `Expected built artifact ${fileName}. Run \`pnpm --filter @cp949/kakao-postcode-react build\` before this check.`,
  ).toBe(true);

  return fs.readFileSync(distPath, "utf8");
};

describe("vite library config", () => {
  it("emits build artifacts that keep React externalized and avoid jsx runtime leakage", () => {
    const esmSource = readBuiltArtifact("index.es.js");
    const umdSource = readBuiltArtifact("index.umd.cjs");

    expect(esmSource).toContain('from "react"');
    expect(esmSource).not.toContain("react/jsx-runtime");
    expect(esmSource).not.toContain("react/jsx-dev-runtime");
    expect(umdSource).toContain('require(`react`)');
    expect(umdSource).toContain("e.KakaoPostcodeEmbed");
    expect(umdSource).toContain("e.useKakaoPostcodeEmbed");
  });
});

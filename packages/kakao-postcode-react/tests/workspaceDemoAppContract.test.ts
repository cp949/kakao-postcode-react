import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace demo app contract", () => {
  it("defines a demo workspace app with MUI and local dev scripts", () => {
    const demoPackageJsonPath = path.resolve(__dirname, "../../../apps/demo/package.json");
    const demoViteConfigPath = path.resolve(__dirname, "../../../apps/demo/vite.config.ts");
    const emittedDemoViteConfigJsPath = path.resolve(__dirname, "../../../apps/demo/vite.config.js");
    const emittedDemoViteConfigDtsPath = path.resolve(
      __dirname,
      "../../../apps/demo/vite.config.d.ts",
    );

    expect(fs.existsSync(demoPackageJsonPath)).toBe(true);
    expect(fs.existsSync(demoViteConfigPath)).toBe(true);
    expect(fs.existsSync(emittedDemoViteConfigJsPath)).toBe(false);
    expect(fs.existsSync(emittedDemoViteConfigDtsPath)).toBe(false);

    const demoPackageJson = JSON.parse(fs.readFileSync(demoPackageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
      name?: string;
    };
    const demoViteConfigSource = fs.readFileSync(demoViteConfigPath, "utf8");

    expect(demoPackageJson.name).toBe("demo");
    expect(demoPackageJson.dependencies?.["@cp949/kakao-postcode-react"]).toBe("workspace:*");
    expect(demoPackageJson.dependencies?.["@mui/material"]).toBeTruthy();
    expect(demoPackageJson.dependencies?.["@emotion/react"]).toBeTruthy();
    expect(demoPackageJson.dependencies?.["@emotion/styled"]).toBeTruthy();
    expect(demoPackageJson.dependencies?.react).toBeTruthy();
    expect(demoPackageJson.dependencies?.["react-dom"]).toBeTruthy();
    expect(demoPackageJson.devDependencies?.vite).toBeTruthy();
    expect(demoPackageJson.devDependencies?.typescript).toBeTruthy();
    expect(demoPackageJson.scripts?.dev).toContain("vite");
    expect(demoPackageJson.scripts?.build).toContain("tsc");
    expect(demoViteConfigSource).toContain("alias");
    expect(demoViteConfigSource).toContain("@cp949/kakao-postcode-react");
  });
});

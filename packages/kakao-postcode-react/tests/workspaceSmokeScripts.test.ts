import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace smoke scripts", () => {
  it("defines browser, artifact, and React-version smoke commands without pinning workspace scripts to exact patch releases", () => {
    const workspacePackageJsonPath = path.resolve(__dirname, "../../../package.json");
    const workspacePackageJson = JSON.parse(
      fs.readFileSync(workspacePackageJsonPath, "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    const packagePackageJsonPath = path.resolve(__dirname, "../package.json");
    const packagePackageJson = JSON.parse(fs.readFileSync(packagePackageJsonPath, "utf8")) as {
      scripts: Record<string, string>;
    };

    const smokeScriptPath = path.resolve(__dirname, "../../../scripts/react-version-smoke.mjs");

    expect(packagePackageJson.scripts["test:artifacts"]).toContain("distArtifacts.test.ts");
    expect(packagePackageJson.scripts["test:artifacts"]).toContain("libraryBuildConfig.test.ts");
    expect(workspacePackageJson.scripts["test:browser"]).toContain(
      "@cp949/kakao-postcode-react run test:browser",
    );
    expect(workspacePackageJson.scripts["smoke:react18"]).toContain("--react-version 18");
    expect(workspacePackageJson.scripts["smoke:react19"]).toContain("--react-version 19");
    expect(fs.existsSync(smokeScriptPath)).toBe(true);

    const smokeScriptSource = fs.readFileSync(smokeScriptPath, "utf8");

    expect(smokeScriptSource).toContain("PACKAGE_NAME");
    expect(smokeScriptSource).toContain("jsdom");
    expect(smokeScriptSource).toContain("render-smoke.mjs");
    expect(smokeScriptSource).toContain("render-smoke.cjs");
    expect(smokeScriptSource).toContain("EXPECTED_EXPORTS");
    expect(smokeScriptSource).toContain("assertExportsMatch");
    expect(smokeScriptSource).toContain("loadingFallback");
    expect(smokeScriptSource).toContain("errorFallback");
    expect(smokeScriptSource).toContain("autoClose: false");
    expect(smokeScriptSource).toContain('q: "판교역"');
  });
});

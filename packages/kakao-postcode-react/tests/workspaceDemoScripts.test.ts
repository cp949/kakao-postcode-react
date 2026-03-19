import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace demo scripts and docs", () => {
  it("documents how to run the local demo app and exposes a helper script", () => {
    const workspacePackageJsonPath = path.resolve(__dirname, "../../../package.json");
    const readmePath = path.resolve(__dirname, "../../../README.md");

    const workspacePackageJson = JSON.parse(
      fs.readFileSync(workspacePackageJsonPath, "utf8"),
    ) as {
      scripts?: Record<string, string>;
    };
    const readme = fs.readFileSync(readmePath, "utf8");

    expect(workspacePackageJson.scripts?.dev).toContain("pnpm --filter demo dev");
    expect(workspacePackageJson.scripts?.["demo:dev"]).toContain("pnpm --filter demo dev");
    expect(workspacePackageJson.scripts?.["demo:build"]).toContain("pnpm --filter demo build");
    expect(readme).toContain("Local Demo");
    expect(readme).toContain("pnpm dev");
    expect(readme).toContain("pnpm demo:dev");
    expect(readme).toContain("Dialog 예제");
    expect(readme).toContain("호출자에게 반환");
    expect(readme).toContain("핵심 코드");
  });
});

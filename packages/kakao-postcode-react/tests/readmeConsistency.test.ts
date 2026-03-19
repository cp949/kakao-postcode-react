import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("README consistency", () => {
  it("keeps release stage language and loader recovery guidance aligned with the package state", () => {
    const packageJsonPath = path.resolve(__dirname, "../package.json");
    const packageReadmePath = path.resolve(__dirname, "../README.md");
    const workspaceReadmePath = path.resolve(__dirname, "../../../README.md");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      version: string;
    };
    const packageReadme = fs.readFileSync(packageReadmePath, "utf8");
    const workspaceReadme = fs.readFileSync(workspaceReadmePath, "utf8");

    if (packageJson.version.startsWith("0.")) {
      expect(packageReadme).not.toContain("1.x");
    }

    expect(packageReadme).toContain("the next load attempt");
    expect(workspaceReadme).toContain("the next load attempt");
    expect(workspaceReadme).not.toContain("Calling `reload()` after an error is the normal recovery path.");
  });

  it("documents embed-only q and autoClose options in both READMEs", () => {
    const packageReadmePath = path.resolve(__dirname, "../README.md");
    const workspaceReadmePath = path.resolve(__dirname, "../../../README.md");
    const packageReadme = fs.readFileSync(packageReadmePath, "utf8");
    const workspaceReadme = fs.readFileSync(workspaceReadmePath, "utf8");

    expect(packageReadme).toContain("q");
    expect(packageReadme).toContain("autoClose");
    expect(packageReadme).toContain("passed to Kakao's `embed()` options");

    expect(workspaceReadme).toContain("q");
    expect(workspaceReadme).toContain("autoClose");
    expect(workspaceReadme).toContain("passed to Kakao's `embed()` options");
  });
});

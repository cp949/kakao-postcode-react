import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("package manifest", () => {
  it("publishes stable runtime entrypoints and documents the Node 20+ tooling policy clearly", () => {
    const packageJsonPath = path.resolve(__dirname, "../package.json");
    const packageDir = path.dirname(packageJsonPath);
    const rootReadmePath = path.resolve(packageDir, "../../README.md");
    const packageReadmePath = path.resolve(packageDir, "README.md");
    const rootReadme = fs.readFileSync(rootReadmePath, "utf8");
    const packageReadme = fs.readFileSync(packageReadmePath, "utf8");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      description: string;
      engines?: {
        node?: string;
      };
      license?: string;
      exports: {
        ".": {
          import: string;
          require: string;
          types: string;
        };
      };
      files?: string[];
      main: string;
      module: string;
      scripts?: Record<string, string>;
      types: string;
      peerDependencies: {
        react: string;
        "react-dom": string;
      };
    };

    expect(packageJson.main).toBe("dist/index.umd.cjs");
    expect(packageJson.module).toBe("dist/index.es.js");
    expect(packageJson.types).toBe("dist/index.d.ts");
    expect(packageJson.exports["."].import).toBe("./dist/index.es.js");
    expect(packageJson.exports["."].require).toBe("./dist/index.umd.cjs");
    expect(packageJson.exports["."].types).toBe("./dist/index.d.ts");
    expect(packageJson.description).toContain("embed()");
    expect(packageJson.engines?.node).toBe(">=20");
    expect(packageJson.license).toBe("ISC");
    expect(packageJson.files).toContain("dist");
    expect(packageJson.peerDependencies.react).toBe("^18.0.0 || ^19.0.0");
    expect(packageJson.peerDependencies["react-dom"]).toBe("^18.0.0 || ^19.0.0");
    expect(packageJson.scripts?.release).not.toContain("--no-git-checks");
    expect(fs.existsSync(packageReadmePath)).toBe(true);
    expect(fs.existsSync(path.resolve(packageDir, "../../LICENSE"))).toBe(true);
    expect(rootReadme).toContain("Node.js` 20 or newer");
    expect(rootReadme).toContain("development, CI, and package installation");
    expect(packageReadme).toContain("Node 20+ for development, CI, and package installation");
    expect(packageReadme).toContain("does not change the browser runtime requirement");
  });

  it("keeps package-level test configuration outside src", () => {
    const packageDir = path.resolve(__dirname, "..");
    const packageJsonPath = path.join(packageDir, "package.json");
    const vitestConfigPath = path.join(packageDir, "vitest.config.ts");
    const viteConfigPath = path.join(packageDir, "vite.config.ts");

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    const vitestConfig = fs.readFileSync(vitestConfigPath, "utf8");
    const viteConfig = fs.readFileSync(viteConfigPath, "utf8");

    expect(packageJson.scripts?.test).toContain("tests/distArtifacts.test.ts");
    expect(packageJson.scripts?.test).toContain("tests/libraryBuildConfig.test.ts");
    expect(packageJson.scripts?.test).not.toContain("src/__tests__");
    expect(packageJson.scripts?.["test:artifacts"]).toContain("tests/distArtifacts.test.ts");
    expect(packageJson.scripts?.["test:artifacts"]).toContain("tests/libraryBuildConfig.test.ts");
    expect(packageJson.scripts?.["test:artifacts"]).not.toContain("src/__tests__");
    expect(vitestConfig).toContain('./tests/setup.ts');
    expect(vitestConfig).not.toContain("src/__tests__");
    expect(viteConfig).toContain('exclude: ["tests/**"]');
    expect(viteConfig).not.toContain("src/__tests__");
  });
});

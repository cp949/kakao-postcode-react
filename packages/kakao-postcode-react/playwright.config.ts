import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const port = 4173;
const packageDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.resolve(packageDir, "browser"),
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    headless: true,
  },
  webServer: {
    command: `pnpm exec vite --config ${path.resolve(packageDir, "browser/vite.config.ts")} --host 127.0.0.1 --port ${port}`,
    cwd: packageDir,
    reuseExistingServer: true,
    timeout: 120_000,
    url: `http://127.0.0.1:${port}`,
  },
});

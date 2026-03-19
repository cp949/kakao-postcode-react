import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const browserDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: browserDir,
  plugins: [react()],
  resolve: {
    alias: {
      "@pkg": path.resolve(browserDir, "../src"),
    },
  },
});

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@cp949/kakao-postcode-react": path.resolve(
        __dirname,
        "../../packages/kakao-postcode-react/src/index.ts",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
});

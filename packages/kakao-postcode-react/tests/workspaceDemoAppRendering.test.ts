import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace demo app rendering", () => {
  it("renders a themed single-page demo shell for one dialog-based example", () => {
    const mainPath = path.resolve(__dirname, "../../../apps/demo/src/main.tsx");
    const appPath = path.resolve(__dirname, "../../../apps/demo/src/App.tsx");
    const themePath = path.resolve(__dirname, "../../../apps/demo/src/theme.ts");

    expect(fs.existsSync(mainPath)).toBe(true);
    expect(fs.existsSync(appPath)).toBe(true);
    expect(fs.existsSync(themePath)).toBe(true);

    const mainSource = fs.readFileSync(mainPath, "utf8");
    const appSource = fs.readFileSync(appPath, "utf8");

    expect(mainSource).toContain("ThemeProvider");
    expect(mainSource).toContain("CssBaseline");
    expect(mainSource).toContain("<App />");
    expect(appSource).toContain("주소 검색을 가장 빠르게 붙여보는 방법");
    expect(appSource).toContain("실행 예제");
    expect(appSource).toContain("핵심 코드");
    expect(appSource).toContain("한 번의 선택으로 호출자 상태까지 연결");
    expect(appSource).toContain("로컬 검증용 쇼케이스");
  });
});

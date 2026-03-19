import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("CI workflow", () => {
  it("keeps browser dependency installation scoped to the smoke job and verifies built artifacts explicitly", () => {
    const workflowPath = path.resolve(__dirname, "../../../.github/workflows/ci.yml");

    expect(fs.existsSync(workflowPath)).toBe(true);

    const workflow = fs.readFileSync(workflowPath, "utf8");
    const verifyJob = workflow.slice(
      workflow.indexOf("  verify:"),
      workflow.indexOf("  smoke:"),
    );
    const smokeJob = workflow.slice(workflow.indexOf("  smoke:"));

    expect(workflow).toContain("matrix:");
    expect(workflow).toContain("node-version: [20, 22]");
    expect(workflow).toContain("pnpm lint");
    expect(workflow).toContain("pnpm check-types");
    expect(workflow).toContain("pnpm --filter @cp949/kakao-postcode-react test");
    expect(workflow).toContain("pnpm --filter @cp949/kakao-postcode-react test:artifacts");
    expect(workflow).toContain("pnpm build");
    expect(workflow).toContain("pnpm test:browser");
    expect(workflow).toContain("pnpm smoke:react18");
    expect(workflow).toContain("pnpm smoke:react19");
    expect(workflow).toContain("node-version: 20");
    expect(verifyJob.indexOf("pnpm --filter @cp949/kakao-postcode-react test")).toBeLessThan(
      verifyJob.indexOf("pnpm build"),
    );
    expect(verifyJob.indexOf("pnpm build")).toBeLessThan(
      verifyJob.indexOf("pnpm --filter @cp949/kakao-postcode-react test:artifacts"),
    );
    expect(verifyJob).not.toContain("pnpm exec playwright install --with-deps chromium");
    expect(smokeJob).toContain("pnpm exec playwright install --with-deps chromium");
  });
});

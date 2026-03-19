import { expect, test } from "@playwright/test";

const KAKAO_POSTCODE_SCRIPT_URL =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

const mockScriptSource = `
(() => {
  const update = () => {
    window.dispatchEvent(new Event("__kakao_mock_update"));
  };

  const state = window.__kakaoMockState ?? {
    constructorCount: 0,
    embedCount: 0,
    loadCount: 0,
    lastHeight: null,
    lastQuery: null,
    lastAutoClose: null,
  };

  state.loadCount += 1;
  window.__kakaoMockState = state;

  window.kakao = window.kakao ?? {};
  window.kakao.Postcode = function Postcode(options) {
    state.constructorCount += 1;
    state.lastHeight = options?.height ?? null;
    update();

    return {
      embed(element, embedOptions) {
        state.embedCount += 1;
        state.lastQuery = embedOptions?.q ?? null;
        state.lastAutoClose = embedOptions?.autoClose ?? null;
        element.innerHTML = "<div data-testid=\\"mock-embed\\">Mock embed #" + state.embedCount + "</div>";
        update();
      },
    };
  };

  update();
})();
`;

test.beforeEach(async ({ page }) => {
  await page.route(KAKAO_POSTCODE_SCRIPT_URL, async (route) => {
    await route.fulfill({
      body: mockScriptSource,
      contentType: "application/javascript",
      status: 200,
    });
  });
});

test("mount reaches open and survives rerender", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("status")).toHaveText("open");
  await expect(page.getByTestId("embed-container")).toContainText("Mock embed #1");
  await expect(page.getByTestId("script-count")).toHaveText("1");
  await expect(page.getByTestId("constructor-count")).toHaveText("1");
  await expect(page.getByTestId("embed-count")).toHaveText("1");
  await expect(page.getByTestId("last-height")).toHaveText("480");

  await page.getByTestId("rerender").click();

  await expect(page.getByTestId("render-count")).toHaveText("1");
  await expect(page.getByTestId("status")).toHaveText("open");
  await expect(page.getByTestId("embed-count")).toHaveText("1");
});

test("reload re-embeds without remounting the container", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("status")).toHaveText("open");
  await page.getByTestId("reload").click();

  await expect(page.getByTestId("status")).toHaveText("open");
  await expect(page.getByTestId("constructor-count")).toHaveText("2");
  await expect(page.getByTestId("embed-count")).toHaveText("2");
  await expect(page.getByTestId("embed-container")).toContainText("Mock embed #2");
});

test("passes q and autoClose through embed options in the browser bundle", async ({ page }) => {
  await page.goto("/?mode=hook-options");

  await expect(page.getByTestId("status")).toHaveText("open");
  await expect(page.getByTestId("last-query")).toHaveText("판교역");
  await expect(page.getByTestId("last-auto-close")).toHaveText("false");
});

test("concurrent loader calls inject only one Kakao script", async ({ page }) => {
  await page.goto("/?mode=loader");

  await page.getByTestId("load-concurrently").click();

  await expect(page.getByTestId("phase")).toHaveText("loaded");
  await expect(page.getByTestId("script-count")).toHaveText("1");
  await expect(page.getByTestId("load-count")).toHaveText("1");
});

test("reuses an existing Kakao script tag instead of appending a duplicate", async ({ page }) => {
  await page.goto("/?mode=loader-preloaded");

  await expect(page.getByTestId("script-count")).toHaveText("1");
  await page.getByTestId("load-concurrently").click();

  await expect(page.getByTestId("phase")).toHaveText("loaded");
  await expect(page.getByTestId("script-count")).toHaveText("1");
  await expect(page.getByTestId("load-count")).toHaveText("1");
});

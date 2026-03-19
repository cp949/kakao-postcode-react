import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const PACKAGE_NAME = "@cp949/kakao-postcode-react";
const SMOKE_TIMEOUT_MS = 2000;
const SMOKE_POLL_MS = 10;

const EXPECTED_EXPORTS = [
  "KakaoPostcodeEmbed",
  "loadKakaoPostcodeScript",
  "normalizeKakaoPostcodeResult",
  "useKakaoPostcodeEmbed",
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const reactVersionIndex = args.indexOf("--react-version");

  if (reactVersionIndex === -1 || !args[reactVersionIndex + 1]) {
    throw new Error('Usage: node scripts/react-version-smoke.mjs --react-version <version>');
  }

  return {
    reactVersion: args[reactVersionIndex + 1],
  };
};

const run = (command, args, cwd) => {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
  });
};

const runAndCapture = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const createWaitForSource = () => `
const waitFor = async (predicate, message) => {
  const timeoutAt = Date.now() + ${SMOKE_TIMEOUT_MS};

  while (Date.now() < timeoutAt) {
    if (predicate()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, ${SMOKE_POLL_MS}));
  }

  throw new Error(message);
};
`;

const createDomSetupSource = () => `
const setupDom = () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Node = window.Node;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.MutationObserver = window.MutationObserver;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: window.navigator,
  });

  return window;
};
`;

const createKakaoMockSource = () => `
const installKakaoMock = (window, state) => {
  window.kakao = {
    Postcode: function Postcode() {
      state.constructorCount += 1;

      this.embed = (element, embedOptions) => {
        state.embedCount += 1;
        state.lastEmbedOptions = embedOptions ?? null;
        element.innerHTML = '<div data-testid="mock-embed">mock embed</div>';
      };
    },
  };
};
`;

const assertExportsMatch = (moduleKind, reactVersion, actualExports) => {
  if (JSON.stringify(actualExports) !== JSON.stringify(EXPECTED_EXPORTS)) {
    throw new Error(
      `Unexpected ${moduleKind} exports for React ${reactVersion}: ${JSON.stringify(actualExports)}`,
    );
  }
};

const createEsmRenderSmokeSource = () => `
import { JSDOM } from "jsdom";
import React from "react";
import { createRoot } from "react-dom/client";
${createWaitForSource()}
${createDomSetupSource()}

const importFreshPackage = async (tag) => {
  const packageEntryUrl = import.meta.resolve("${PACKAGE_NAME}");
  return import(packageEntryUrl + "?scenario=" + tag);
};
${createKakaoMockSource()}

const runOpenScenario = async () => {
  const window = setupDom();
  const state = {
    embedCount: 0,
    constructorCount: 0,
    lastEmbedOptions: null,
  };
  installKakaoMock(window, state);

  const { KakaoPostcodeEmbed, useKakaoPostcodeEmbed } = await importFreshPackage("open");

  const componentContainer = document.createElement("div");
  document.body.append(componentContainer);
  const componentRoot = createRoot(componentContainer);
  componentRoot.render(
    React.createElement(KakaoPostcodeEmbed, {
      height: 420,
    }),
  );

  await waitFor(
    () => componentContainer.querySelector("[data-testid=\\"mock-embed\\"]") !== null,
    "Component render smoke did not embed the Kakao mock.",
  );

  const hookContainer = document.createElement("div");
  document.body.append(hookContainer);

  const HookHarness = () => {
    const { containerRef, status } = useKakaoPostcodeEmbed({
      height: 420,
      q: "판교역",
      autoClose: false,
    });

    return React.createElement(
      "div",
      null,
      React.createElement("span", { "data-testid": "hook-status" }, status),
      React.createElement("div", { ref: containerRef }),
    );
  };

  const hookRoot = createRoot(hookContainer);
  hookRoot.render(React.createElement(HookHarness));

  await waitFor(
    () => hookContainer.textContent?.includes("open") === true,
    "Hook render smoke did not reach open status.",
  );

  if (state.constructorCount < 2) {
    throw new Error(
      "Expected both component and hook render smoke paths to construct Kakao Postcode.",
    );
  }

  if (state.embedCount < 2) {
    throw new Error("Expected both component and hook render smoke paths to call embed().");
  }

  if (state.lastEmbedOptions?.q !== "판교역" || state.lastEmbedOptions?.autoClose !== false) {
    throw new Error("Hook render smoke did not pass q/autoClose through embed().");
  }

  componentRoot.unmount();
  hookRoot.unmount();
};

const runLoadingFallbackScenario = async () => {
  const window = setupDom();
  const state = {
    embedCount: 0,
    constructorCount: 0,
    lastEmbedOptions: null,
  };
  const { KakaoPostcodeEmbed } = await importFreshPackage("loading");
  const originalAppend = document.head.append.bind(document.head);

  document.head.append = (...nodes) => {
    const result = originalAppend(...nodes);
    const script = nodes.find((node) => node instanceof window.HTMLScriptElement);

    if (script) {
      setTimeout(() => {
        installKakaoMock(window, state);
        script.dispatchEvent(new window.Event("load"));
      }, 20);
    }

    return result;
  };

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    React.createElement(KakaoPostcodeEmbed, {
      height: 420,
      loadingFallback: React.createElement("div", null, "Custom loading..."),
    }),
  );

  await waitFor(
    () => container.textContent?.includes("Custom loading...") === true,
    "Component render smoke did not show loadingFallback.",
  );
  await waitFor(
    () => container.querySelector("[data-testid=\\"mock-embed\\"]") !== null,
    "Component render smoke did not recover from loadingFallback into embed.",
  );

  document.head.append = originalAppend;
  root.unmount();
};

const runErrorFallbackScenario = async () => {
  const window = setupDom();
  const { KakaoPostcodeEmbed } = await importFreshPackage("error");
  const originalAppend = document.head.append.bind(document.head);

  document.head.append = (...nodes) => {
    const result = originalAppend(...nodes);
    const script = nodes.find((node) => node instanceof window.HTMLScriptElement);

    if (script) {
      setTimeout(() => {
        script.dispatchEvent(new window.Event("error"));
      }, 20);
    }

    return result;
  };

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    React.createElement(KakaoPostcodeEmbed, {
      height: 420,
      errorFallback: (error) =>
        React.createElement("div", null, "Custom error: " + error.code),
    }),
  );

  await waitFor(
    () => container.textContent?.includes("Custom error: script_load_error") === true,
    "Component render smoke did not render function errorFallback.",
  );

  document.head.append = originalAppend;
  root.unmount();
};

await runOpenScenario();
await runLoadingFallbackScenario();
await runErrorFallbackScenario();
`;

const createCjsRenderSmokeSource = () => `
const { JSDOM } = require("jsdom");
const React = require("react");
const { createRoot } = require("react-dom/client");
const { KakaoPostcodeEmbed, useKakaoPostcodeEmbed } = require("${PACKAGE_NAME}");
${createWaitForSource()}
${createDomSetupSource()}
${createKakaoMockSource()}

const runOpenScenario = async () => {
  const window = setupDom();
  const state = {
    embedCount: 0,
    constructorCount: 0,
    lastEmbedOptions: null,
  };
  installKakaoMock(window, state);

  const componentContainer = document.createElement("div");
  document.body.append(componentContainer);
  const componentRoot = createRoot(componentContainer);
  componentRoot.render(
    React.createElement(KakaoPostcodeEmbed, {
      height: 420,
    }),
  );

  await waitFor(
    () => componentContainer.querySelector("[data-testid=\\"mock-embed\\"]") !== null,
    "CJS component render smoke did not embed the Kakao mock.",
  );

  const hookContainer = document.createElement("div");
  document.body.append(hookContainer);

  const HookHarness = () => {
    const { containerRef, status } = useKakaoPostcodeEmbed({
      height: 420,
      q: "판교역",
      autoClose: false,
    });

    return React.createElement(
      "div",
      null,
      React.createElement("span", { "data-testid": "hook-status" }, status),
      React.createElement("div", { ref: containerRef }),
    );
  };

  const hookRoot = createRoot(hookContainer);
  hookRoot.render(React.createElement(HookHarness));

  await waitFor(
    () => hookContainer.textContent?.includes("open") === true,
    "CJS hook render smoke did not reach open status.",
  );

  if (state.constructorCount < 2) {
    throw new Error(
      "Expected both CJS component and hook render smoke paths to construct Kakao Postcode.",
    );
  }

  if (state.embedCount < 2) {
    throw new Error("Expected both CJS component and hook render smoke paths to call embed().");
  }

  if (state.lastEmbedOptions?.q !== "판교역" || state.lastEmbedOptions?.autoClose !== false) {
    throw new Error("CJS hook render smoke did not pass q/autoClose through embed().");
  }

  componentRoot.unmount();
  hookRoot.unmount();
};

const runErrorFallbackScenario = async () => {
  const window = setupDom();
  const originalAppend = document.head.append.bind(document.head);

  document.head.append = (...nodes) => {
    const result = originalAppend(...nodes);
    const script = nodes.find((node) => node instanceof window.HTMLScriptElement);

    if (script) {
      setTimeout(() => {
        script.dispatchEvent(new window.Event("error"));
      }, 20);
    }

    return result;
  };

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    React.createElement(KakaoPostcodeEmbed, {
      height: 420,
      errorFallback: (error) =>
        React.createElement("div", null, "Custom error: " + error.code),
    }),
  );

  await waitFor(
    () => container.textContent?.includes("Custom error: script_load_error") === true,
    "CJS component render smoke did not render function errorFallback.",
  );

  document.head.append = originalAppend;
  root.unmount();
};

const main = async () => {
  await runOpenScenario();
  await runErrorFallbackScenario();
};

void main();
`;

const main = () => {
  const { reactVersion } = parseArgs();
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const packageDir = path.resolve(rootDir, "packages/kakao-postcode-react");
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "kakao-postcode-react-smoke-"));
  const packDir = path.join(tempRoot, "pack");
  const consumerDir = path.join(tempRoot, "consumer");

  try {
    mkdirSync(packDir, { recursive: true });
    mkdirSync(consumerDir, { recursive: true });
    run("pnpm", ["--filter", PACKAGE_NAME, "run", "build"], rootDir);
    run(
      "pnpm",
      ["--filter", PACKAGE_NAME, "pack", "--pack-destination", packDir],
      rootDir,
    );

    const tarballName = readdirSync(packDir).find((entry) => entry.endsWith(".tgz"));

    if (!tarballName) {
      throw new Error("Packed tarball was not created.");
    }

    writeFileSync(
      path.join(consumerDir, "package.json"),
      JSON.stringify(
        {
          name: "react-version-smoke",
          private: true,
          type: "module",
        },
        null,
        2,
      ),
    );
    writeFileSync(path.join(consumerDir, "render-smoke.mjs"), createEsmRenderSmokeSource());
    writeFileSync(path.join(consumerDir, "render-smoke.cjs"), createCjsRenderSmokeSource());

    run(
      "pnpm",
      [
        "add",
        `react@${reactVersion}`,
        `react-dom@${reactVersion}`,
        "jsdom",
        path.join(packDir, tarballName),
      ],
      consumerDir,
    );

    const esmExports = runAndCapture(
      "node",
      [
        "--input-type=module",
        "-e",
        `import("${PACKAGE_NAME}").then((mod) => {
          console.log(JSON.stringify(Object.keys(mod).sort()));
        });`,
      ],
      consumerDir,
    );
    const cjsExports = runAndCapture(
      "node",
      [
        "-e",
        `console.log(JSON.stringify(Object.keys(require("${PACKAGE_NAME}")).sort()))`,
      ],
      consumerDir,
    );

    const parsedEsmExports = JSON.parse(esmExports);
    const parsedCjsExports = JSON.parse(cjsExports);

    assertExportsMatch("ESM", reactVersion, parsedEsmExports);
    assertExportsMatch("CJS", reactVersion, parsedCjsExports);

    run("node", ["render-smoke.mjs"], consumerDir);
    run("node", ["render-smoke.cjs"], consumerDir);

    console.log(`React ${reactVersion} smoke passed.`);
  } finally {
    rmSync(tempRoot, { force: true, recursive: true });
  }
};

main();

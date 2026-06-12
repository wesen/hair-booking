__package__({
  name: "fringe",
  parents: [],
  short: "Fringe hair booking design system verbs",
});

const fs = require("fs");
const path = require("path");

// ─── Target registry ─────────────────────────────────────────
const MOBILE_SCREENS = [
  { page: "service",  path: "/standalone/mobile/01-service.html",  selector: '[data-page="service"]' },
  { page: "color",    path: "/standalone/mobile/02-color.html",    selector: '[data-page="color"]' },
  { page: "length",   path: "/standalone/mobile/03-length.html",   selector: '[data-page="length"]' },
  { page: "photos",   path: "/standalone/mobile/04-photos.html",   selector: '[data-page="photos"]' },
  { page: "history",  path: "/standalone/mobile/05-history.html",  selector: '[data-page="history"]' },
  { page: "budget",   path: "/standalone/mobile/06-budget.html",   selector: '[data-page="budget"]' },
  { page: "estimate", path: "/standalone/mobile/07-estimate.html", selector: '[data-page="estimate"]' },
  { page: "booking",  path: "/standalone/mobile/08-booking.html",  selector: '[data-page="booking"]' },
  { page: "confirm",  path: "/standalone/mobile/09-confirm.html",  selector: '[data-page="confirm"]' },
];

// Component selectors per screen for overlay annotations.
// These map design regions to component names and use color coding:
//   blue (#0096ff)  = organisms (page-level sections)
//   tomato (#ff6347) = molecules (reusable compositions)
//   green (#32cd32)  = atoms (primitives)
//   gold (#ffbf00)   = chrome (status bar, nav, CTA bar)
//
// IMPORTANT: The prototype JSX uses inline styles with no data-* attributes.
// Per-component selectors require adding data-section/data-component attributes
// to the prototype screens (or to the standalone HTML wrappers).
// Until that is done, only top-level screen selectors are available.
// The annotatedAll verb falls back to a single "Full Screen" target when no
// component selectors are defined.
const SCREEN_COMPONENTS = {
  // Example of what this will look like after adding data-section attributes:
  // service: {
  //   organisms: {
  //     "Intro Section": '[data-section="intro"]',
  //     "Service List": '[data-section="service-list"]',
  //   },
  //   chrome: {
  //     "CTA Bar": '[data-section="intake-cta"]',
  //   },
  // },
};

// Default overlay style configuration
const OVERLAY_STYLE = {
  label: { fontSize: 11, radius: 3, padding: [3, 6] },
  legend: { position: "bottom-right", background: "rgba(255,255,255,0.92)", color: "#27221b" },
  targetDefaults: { borderWidth: 2, labelColor: "white" },
};

const TYPE_COLORS = {
  organisms: { borderColor: "#0096ff", label: { background: "#0096ff" } },
  molecules:  { borderColor: "#ff6347", label: { background: "#ff6347" } },
  atoms:      { borderColor: "#32cd32", label: { background: "#32cd32" } },
  chrome:     { borderColor: "#ffbf00", label: { background: "#ffbf00" } },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildOverlaySpec(screenKey) {
  const cvd = require("css-visual-diff");
  const components = SCREEN_COMPONENTS[screenKey];
  if (!components) return null;

  const builder = cvd.overlaySpec()
    .legend(true)
    .screenshot("fullPage")
    .style(OVERLAY_STYLE);

  for (const [typeName, style] of Object.entries(TYPE_COLORS)) {
    const targets = components[typeName] || {};
    for (const [name, selector] of Object.entries(targets)) {
      builder.target(
        cvd.overlayTarget(name)
          .selector(selector)
          .style(style)
      );
    }
  }
  return builder.build();
}

// ─── List targets ─────────────────────────────────────────────
async function listTargets(values) {
  return MOBILE_SCREENS.map((s) => ({
    page: s.page,
    path: s.path,
    selector: s.selector,
    variant: "mobile",
    viewport: "390x844",
  }));
}

__verb__("listTargets", {
  parents: ["fringe", "pages"],
  short: "List all Fringe intake screen targets",
  output: "structured",
  fields: { values: { bind: "all" } },
});

// ─── Inspect one screen ──────────────────────────────────────
async function inspectScreen(page_name, values) {
  const cvd = require("css-visual-diff");
  const target = MOBILE_SCREENS.find((s) => s.page === page_name);
  if (!target) throw new Error("unknown page: " + page_name);

  const browser = await cvd.browser();
  try {
    const page = await browser.page(
      (values.prototypeBase || "http://localhost:7071") + target.path,
      { viewport: { width: 390, height: 844 }, waitMs: values.waitMs || 2000, name: target.page }
    );

    const loc = page.locator(target.selector);
    const status = await loc.status();
    if (!status.exists) {
      return { page: target.page, exists: false, error: "selector not found: " + target.selector };
    }

    const [text, bounds, styles] = await Promise.all([
      loc.text({ normalizeWhitespace: true, trim: true }),
      loc.bounds(),
      loc.computedStyle(["display", "position", "width", "height", "background-color", "color", "font-family", "font-size", "border-radius", "overflow"]),
    ]);

    return { page: target.page, exists: true, visible: status.visible, text: text.slice(0, 200), bounds, styles };
  } finally {
    await browser.close();
  }
}

__verb__("inspectScreen", {
  parents: ["fringe", "pages"],
  short: "Inspect one intake screen's rendered state",
  output: "structured",
  fields: {
    page_name: { argument: true, required: true, help: "Page slug (service, color, ...)" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
  },
});

// ─── Snapshot one screen ─────────────────────────────────────
async function snapshotScreen(page_name, outDir, values) {
  const cvd = require("css-visual-diff");
  const target = MOBILE_SCREENS.find((s) => s.page === page_name);
  if (!target) throw new Error("unknown page: " + page_name);

  const browser = await cvd.browser();
  try {
    const page = await browser.page(
      (values.prototypeBase || "http://localhost:7071") + target.path,
      { viewport: { width: 390, height: 844 }, waitMs: values.waitMs || 2000, name: target.page }
    );

    const result = await cvd.snapshot(page, [
      cvd.probe("screen-shell").selector(target.selector).required().bounds()
        .styles(["display", "position", "width", "height", "background-color", "overflow"]),
    ]);

    ensureDir(outDir);
    await cvd.write.json(path.join(outDir, "snapshot.json"), result);
    return { page: target.page, ok: true, probeCount: result.results.length, outputDir: outDir };
  } finally {
    await browser.close();
  }
}

__verb__("snapshotScreen", {
  parents: ["fringe", "pages"],
  short: "Capture a semantic snapshot of one intake screen",
  output: "structured",
  fields: {
    page_name: { argument: true, required: true, help: "Page slug" },
    outDir: { argument: true, required: true, help: "Output directory" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
  },
});

// ─── Annotated PNG overlay for one screen ────────────────────
async function annotatedPng(page_name, outDir, values) {
  const cvd = require("css-visual-diff");
  const target = MOBILE_SCREENS.find((s) => s.page === page_name);
  if (!target) throw new Error("unknown page: " + page_name);

  const spec = buildOverlaySpec(page_name);
  const base = values.prototypeBase || "http://localhost:7071";

  ensureDir(outDir);

  const browser = await cvd.browser();
  try {
    const page = await browser.page(
      base + target.path,
      { viewport: { width: 390, height: 844 }, waitMs: values.waitMs || 2000, name: target.page }
    );

    // Disable smooth scroll so screenshot is deterministic
    await page.css("html { scroll-behavior: auto !important; }");

    const outPath = path.join(outDir, target.page + ".annotated.png");

    if (spec) {
      // Use the overlay spec with component selectors
      const result = await page.overlay(spec).screenshot(outPath);
      return {
        page: target.page,
        ok: true,
        kind: "annotated-png",
        outPath: result.outputPath,
        width: result.width,
        height: result.height,
        targetCount: result.targets.length,
      };
    } else {
      // No component selectors defined for this screen — just screenshot
      const result = await page
        .overlay(
          cvd.overlaySpec()
            .legend(true)
            .screenshot("fullPage")
            .style(OVERLAY_STYLE)
            .target(cvd.overlayTarget("Full Screen").selector(target.selector).style(TYPE_COLORS.organisms))
            .build()
        )
        .screenshot(outPath);
      return {
        page: target.page,
        ok: true,
        kind: "annotated-png",
        outPath: result.outputPath,
        width: result.width,
        height: result.height,
        targetCount: result.targets.length,
      };
    }
  } finally {
    await browser.close();
  }
}

__verb__("annotatedPng", {
  parents: ["fringe", "pages"],
  short: "Export one annotated overlay PNG for an intake screen",
  output: "structured",
  fields: {
    page_name: { argument: true, required: true, help: "Page slug" },
    outDir: { argument: true, required: true, help: "Output directory" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
    contentAlphaPercent: { type: "int", default: 10, help: "Overlay fill opacity (0=border-only, 100=solid)" },
  },
});

// ─── Annotated PNGs for all screens ──────────────────────────
async function annotatedAll(outDir, values) {
  const cvd = require("css-visual-diff");
  const base = values.prototypeBase || "http://localhost:7071";
  const waitMs = values.waitMs || 2000;

  ensureDir(outDir);

  const results = [];
  const browser = await cvd.browser();
  try {
    for (const target of MOBILE_SCREENS) {
      const page = await browser.page(
        base + target.path,
        { viewport: { width: 390, height: 844 }, waitMs, name: target.page }
      );

      await page.css("html { scroll-behavior: auto !important; }");

      const spec = buildOverlaySpec(target.page);
      const outPath = path.join(outDir, target.page + ".annotated.png");

      let result;
      if (spec) {
        result = await page.overlay(spec).screenshot(outPath);
      } else {
        result = await page
          .overlay(
            cvd.overlaySpec()
              .legend(true)
              .screenshot("fullPage")
              .style(OVERLAY_STYLE)
              .target(cvd.overlayTarget("Full Screen").selector(target.selector).style(TYPE_COLORS.organisms))
              .build()
          )
          .screenshot(outPath);
      }

      results.push({
        page: target.page,
        ok: true,
        outPath: result.outputPath,
        width: result.width,
        height: result.height,
        targetCount: result.targets.length,
      });

      await page.close();
    }
  } finally {
    await browser.close();
  }

  return results;
}

__verb__("annotatedAll", {
  parents: ["fringe", "pages"],
  short: "Export annotated overlay PNGs for all intake screens",
  output: "structured",
  fields: {
    outDir: { argument: true, required: true, help: "Output directory" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
    contentAlphaPercent: { type: "int", default: 10, help: "Overlay fill opacity (0=border-only, 100=solid)" },
  },
});

// ─── Component gallery for one screen ────────────────────────
// Extracts component screenshots, annotated PNGs, JSON model, and an HTML gallery
async function gallery(page_name, outDir, values) {
  const cvd = require("css-visual-diff");
  const target = MOBILE_SCREENS.find((s) => s.page === page_name);
  if (!target) throw new Error("unknown page: " + page_name);
  const base = values.prototypeBase || "http://localhost:7071";
  const components = SCREEN_COMPONENTS[page_name] || {};

  ensureDir(outDir);
  ensureDir(path.join(outDir, "annotated"));
  ensureDir(path.join(outDir, "components"));

  const browser = await cvd.browser();
  try {
    const page = await browser.page(
      base + target.path,
      { viewport: { width: 390, height: 844 }, waitMs: values.waitMs || 2000, name: target.page }
    );

    await page.css("html { scroll-behavior: auto !important; }");

    // 1. Inspect all component probes
    const probes = [];
    for (const [typeName, targets] of Object.entries(components)) {
      for (const [name, selector] of Object.entries(targets)) {
        probes.push(
          cvd.probe(name).selector(selector)
            .styles(["display", "width", "height", "background-color", "color", "font-size", "font-weight", "border-radius", "padding-top", "padding-bottom"])
            .attributes(["class", "data-screen-label"])
            .build()
        );
      }
    }

    const inspect = probes.length > 0
      ? await page.inspectAll(probes, { outDir: path.join(outDir, "components"), artifacts: "bundle" })
      : { results: [] };

    // 2. Full-page annotated overlay
    const spec = buildOverlaySpec(page_name);
    const annotatedPath = path.join(outDir, "annotated", target.page + ".annotated.png");
    let fullMap;
    if (spec) {
      fullMap = await page.overlay(spec).screenshot(annotatedPath);
    } else {
      fullMap = await page
        .overlay(
          cvd.overlaySpec().legend(true).screenshot("fullPage").style(OVERLAY_STYLE)
            .target(cvd.overlayTarget("Full Screen").selector(target.selector).style(TYPE_COLORS.organisms))
            .build()
        )
        .screenshot(annotatedPath);
    }

    // 3. Write JSON model
    const model = {
      page: target.page,
      url: base + target.path,
      generatedAt: new Date().toISOString(),
      components: inspect.results,
      annotated: [
        { name: "Full page overlay", path: fullMap.outputPath, width: fullMap.width, height: fullMap.height, targetCount: fullMap.targets.length },
      ],
    };
    fs.writeFileSync(path.join(outDir, "components.json"), JSON.stringify(model, null, 2));

    // 4. Write HTML gallery
    writeGalleryHtml(outDir, model);

    return {
      page: target.page,
      ok: true,
      kind: "gallery",
      outDir,
      html: path.join(outDir, "index.html"),
      components: inspect.results.length,
      annotated: model.annotated.length,
    };
  } finally {
    await browser.close();
  }
}

function rel(from, to) {
  return path.relative(from, to).replace(/\\/g, "/");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
}

function writeGalleryHtml(outDir, model) {
  const annotated = model.annotated.map((item) => `
    <section class="panel">
      <h2>${escapeHtml(item.name)}</h2>
      <p>${item.width}×${item.height} · ${item.targetCount || 0} targets</p>
      <img src="${escapeHtml(rel(outDir, item.path))}" alt="${escapeHtml(item.name)}" />
    </section>`).join("\n");

  const components = (model.components || []).map((item) => {
    const meta = item.metadata || {};
    const screenshot = item.screenshot ? `<img src="${escapeHtml(rel(outDir, item.screenshot))}" alt="${escapeHtml(meta.name || "component")}" />` : "";
    return `<article class="card"><h3>${escapeHtml(meta.name || "component")}</h3><p><code>${escapeHtml(meta.selector || "")}</code></p>${screenshot}</article>`;
  }).join("\n");

  fs.writeFileSync(path.join(outDir, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><title>Fringe overlay — ${escapeHtml(model.page)}</title>
<style>
body{font-family:system-ui,sans-serif;margin:32px;background:#f6efe4;color:#111}img{max-width:100%;height:auto;border:1px solid #ebe7df;background:white}.panel,.card{background:white;border:1px solid #ebe7df;border-radius:10px;padding:16px;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}code{background:#f6efe4;padding:2px 5px;border-radius:4px}
</style></head><body>
<h1>Fringe — ${escapeHtml(model.page)}</h1>
<p>Source: <code>${escapeHtml(model.url)}</code></p>
<h2>Annotated overlays</h2>${annotated}
<h2>Extracted components</h2><div class="grid">${components}</div>
</body></html>`);
}

__verb__("gallery", {
  parents: ["fringe", "pages"],
  short: "Export component screenshots, annotated PNGs, JSON, and an HTML gallery for one screen",
  output: "structured",
  fields: {
    page_name: { argument: true, required: true, help: "Page slug" },
    outDir: { argument: true, required: true, help: "Output directory" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
    contentAlphaPercent: { type: "int", default: 10, help: "Overlay fill opacity" },
  },
});

// ─── Catalog inspect all screens ─────────────────────────────
async function catalogAll(outDir, values) {
  const cvd = require("css-visual-diff");
  const base = values.prototypeBase || "http://localhost:7071";
  const waitMs = values.waitMs || 2000;

  const catalog = cvd.catalog({
    title: "Fringe Intake Screens Catalog",
    outDir,
    artifactRoot: "artifacts",
    indexName: "index.md",
  });

  const browser = await cvd.browser();
  try {
    for (const target of MOBILE_SCREENS) {
      const url = base + target.path;
      const slug = target.page;

      catalog.addTarget({
        slug,
        name: "Intake: " + target.page,
        url,
        selector: target.selector,
        viewport: { width: 390, height: 844 },
        metadata: { variant: "mobile" },
      });

      let page;
      try {
        page = await browser.page(url, {
          viewport: { width: 390, height: 844 },
          waitMs,
          name: slug,
        });

        const probes = [
          cvd.probe("screen-shell").selector(target.selector).required().text().bounds()
            .styles(["display", "width", "height", "background-color", "font-family", "color"]),
        ];

        const preflight = await page.preflight(probes);
        catalog.recordPreflight({ slug, url, selector: target.selector }, preflight);

        const result = await page.inspectAll(probes, {
          outDir: catalog.artifactDir(slug),
          artifacts: values.artifacts || "css-json",
        });
        catalog.addResult({ slug, url }, result);
      } catch (err) {
        catalog.addFailure({ slug, url }, err);
      } finally {
        if (page) await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  await catalog.writeManifest();
  await catalog.writeIndex();
  return catalog.summary();
}

__verb__("catalogAll", {
  parents: ["fringe", "pages"],
  short: "Catalog all intake screens with inspect artifacts",
  output: "structured",
  fields: {
    outDir: { argument: true, required: true, help: "Output directory" },
    values: { bind: "all" },
    prototypeBase: { type: "string", default: "http://localhost:7071" },
    waitMs: { type: "int", default: 2000 },
    artifacts: { type: "string", default: "css-json" },
  },
});

// Fringe intake review verb for css-visual-diff.
// Reads the fringe-intake.yaml spec, compares prototype (standalone HTML) vs
// implementation (Storybook iframe), and produces a review-site data directory.
//
// Usage:
//   css-visual-diff verbs --repository design-galley/visual-diff/userland/verbs \
//     fringe review from-spec \
//     --specFile design-galley/visual-diff/userland/specs/fringe-intake.yaml \
//     --outDir /tmp/fringe-review
//
//   css-visual-diff serve --data-dir /tmp/fringe-review --port 18098 --open

__package__({
  name: "review",
  parents: ["fringe"],
  short: "Generate review-site data comparing prototype vs implementation",
});

// ── Sections ────────────────────────────────────────────────────────────────

__section__("spec", {
  title: "Spec",
  fields: {
    specFile: { type: "string", required: true, help: "Path to the YAML spec file" },
  },
});

__section__("sweepOutput", {
  title: "Output",
  fields: {
    outDir: { type: "string", required: true, help: "Output directory" },
    writeMarkdown: { type: "bool", default: true, help: "Write compare.md" },
    failFast: { type: "bool", default: false, help: "Abort on first error" },
  },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function classify(changedPercent, bands) {
  for (const band of bands) {
    if (changedPercent <= band.maxChangedPercent) return band.name;
  }
  return bands[bands.length - 1].name;
}

function resolveBands(spec) {
  const raw = (spec.policy && spec.policy.bands) || [
    { name: "accepted", maxChangedPercent: 0.5 },
    { name: "review", maxChangedPercent: 10 },
    { name: "tune-required", maxChangedPercent: 30 },
    { name: "major-mismatch", maxChangedPercent: 100 },
  ];
  return raw.slice().sort((a, b) => a.maxChangedPercent - b.maxChangedPercent);
}

const DEFAULT_COMPUTED = [
  "display", "position", "width", "height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "font-family", "font-size", "font-weight", "line-height",
  "letter-spacing", "text-transform",
  "color", "background-color",
  "border-radius", "border-left", "box-shadow", "overflow",
];

function ensureAliases(artifactDir) {
  const fs = require("fs");
  const path = require("path");
  const aliases = [
    ["url1_screenshot.png", "left_region.png"],
    ["url2_screenshot.png", "right_region.png"],
  ];
  for (const [src, dst] of aliases) {
    const s = path.join(artifactDir, src);
    const d = path.join(artifactDir, dst);
    if (fs.existsSync(s) && !fs.existsSync(d)) fs.copyFileSync(s, d);
  }
}

function buildRow(pageName, sectionName, result, spec, outDir) {
  const path = require("path");
  const pd = result.pixel_diff || {};
  const pct = pd.changed_percent || 0;
  const bands = resolveBands(spec);
  const classification = classify(pct, bands);
  const artifactDir = path.join(outDir, pageName, "artifacts", sectionName);

  const computedDiffs = (result.computed_diffs || [])
    .filter(d => d.changed)
    .map(d => ({ property: d.property, left: d.left || "", right: d.right || "" }));

  const leftAttrs = (result.url1 && result.url1.computed && result.url1.computed.attributes) || {};
  const rightAttrs = (result.url2 && result.url2.computed && result.url2.computed.attributes) || {};
  const attrKeys = Object.keys(Object.assign({}, leftAttrs, rightAttrs));
  const attributeDiffs = attrKeys
    .filter(k => leftAttrs[k] !== rightAttrs[k])
    .map(k => ({ attribute: k, left: leftAttrs[k] || null, right: rightAttrs[k] || null }));

  const leftBounds = (result.url1 && result.url1.computed && result.url1.computed.bounds) || null;
  const rightBounds = (result.url2 && result.url2.computed && result.url2.computed.bounds) || null;
  let boundsObj = {};
  if (leftBounds && rightBounds) {
    const changed = leftBounds.height !== rightBounds.height || leftBounds.width !== rightBounds.width;
    boundsObj = {
      changed,
      delta: {
        height: rightBounds.height - leftBounds.height,
        width: rightBounds.width - leftBounds.width,
        x: (rightBounds.x || 0) - (leftBounds.x || 0),
        y: (rightBounds.y || 0) - (leftBounds.y || 0),
      },
      left: leftBounds,
      right: rightBounds,
    };
  }

  return {
    page: pageName,
    section: sectionName,
    classification,
    changedPercent: pct,
    changedPixels: pd.changed_pixels || 0,
    totalPixels: pd.total_pixels || 0,
    threshold: pd.threshold || 30,
    variant: spec.variant || "mobile",
    diffOnlyPath: path.join(artifactDir, "diff_only.png"),
    diffComparisonPath: path.join(artifactDir, "diff_comparison.png"),
    leftRegionPath: path.join(artifactDir, "left_region.png"),
    rightRegionPath: path.join(artifactDir, "right_region.png"),
    artifactJson: path.join(artifactDir, "compare.json"),
    leftSelector: (result.inputs && result.inputs.selector1) || "",
    rightSelector: (result.inputs && result.inputs.selector2) || "",
    styleChangeCount: computedDiffs.length,
    attributeChangeCount: attributeDiffs.length,
    styleDiffs: computedDiffs,
    attributeDiffs,
    bounds: boundsObj,
  };
}

function buildSummary(rows) {
  const counts = {};
  rows.forEach(r => { counts[r.classification] = (counts[r.classification] || 0) + 1; });
  const pages = {};
  rows.forEach(r => { pages[r.page] = true; });
  let maxPct = 0;
  let failureCount = 0;
  rows.forEach(r => {
    if (r.changedPercent > maxPct) maxPct = r.changedPercent;
    if (r.classification === "tune-required" || r.classification === "major-mismatch" || r.classification === "error") failureCount++;
  });
  const worst = rows.length > 0 ? rows.reduce((w, r) => {
    const o = { accepted: 0, review: 1, "tune-required": 2, "major-mismatch": 3, error: 4 };
    return (o[r.classification] || 0) > (o[w.classification] || 0) ? r : w;
  }).classification : "accepted";

  return {
    classificationCounts: counts,
    pageCount: Object.keys(pages).length,
    sectionCount: rows.length,
    maxChangedPercent: maxPct,
    policy: { ok: failureCount === 0, worstClassification: worst, failureCount },
    rows,
  };
}

// ── Verb: from-spec ─────────────────────────────────────────────────────────

async function fromSpec(spec, sweepOutput) {
  const fs = require("fs");
  const pathMod = require("path");
  const yaml = require("yaml");
  const diff = require("diff");

  const specText = fs.readFileSync(spec.specFile, "utf8");
  const specObj = yaml.parse(specText);

  const pageEntries = Object.entries(specObj.pages || {});
  if (pageEntries.length === 0) throw new Error("Spec has no pages");

  const bands = resolveBands(specObj);
  const computedProps = specObj.computed || DEFAULT_COMPUTED;
  const attrProps = specObj.attributes || ["data-component", "data-page", "class"];
  const waitMs = (specObj.defaults && specObj.defaults.waitMs) || 3000;
  const threshold = (specObj.defaults && specObj.defaults.threshold) || 30;
  const vpWidth = (specObj.viewport && specObj.viewport.width) || 390;
  const vpHeight = (specObj.viewport && specObj.viewport.height) || 844;

  const outDir = sweepOutput.outDir;
  const writeMd = sweepOutput.writeMarkdown !== false;
  const failFast = sweepOutput.failFast === true;

  const rows = [];

  for (const [pageName, pageSpec] of pageEntries) {
    const sectionEntries = Object.entries(pageSpec.sections || {});
    if (sectionEntries.length === 0) {
      console.warn("Page \"" + pageName + "\" has no sections, skipping");
      continue;
    }

    for (const [sectionName, sectionSpec] of sectionEntries) {
      const selector = sectionSpec.selector || sectionSpec.leftSelector || sectionSpec.rightSelector;
      if (!selector) {
        console.warn("Section \"" + pageName + "/" + sectionName + "\" has no selector");
        continue;
      }

      const leftSelector = sectionSpec.leftSelector || selector;
      const rightSelector = sectionSpec.rightSelector || selector;
      const leftWait = sectionSpec.leftWaitMs || pageSpec.leftWaitMs || waitMs;
      const rightWait = sectionSpec.rightWaitMs || pageSpec.rightWaitMs || waitMs;

      const artifactDir = pathMod.join(outDir, pageName, "artifacts", sectionName);
      fs.mkdirSync(artifactDir, { recursive: true });

      console.log("Comparing " + pageName + "/" + sectionName + "...");
      console.log("  left:  " + pageSpec.leftUrl + " [" + leftSelector + "]");
      console.log("  right: " + pageSpec.rightUrl + " [" + rightSelector + "]");

      try {
        const result = diff.compareRegion({
          left: { url: pageSpec.leftUrl, selector: leftSelector, waitMs: leftWait },
          right: { url: pageSpec.rightUrl, selector: rightSelector, waitMs: rightWait },
          viewport: { width: vpWidth, height: vpHeight },
          output: {
            outDir: artifactDir,
            threshold,
            writeJson: true,
            writeMarkdown: writeMd,
            writePngs: true,
          },
          computed: computedProps,
          attributes: attrProps,
        });

        ensureAliases(artifactDir);

        const row = buildRow(pageName, sectionName, result, {
          defaults: { threshold },
          variant: specObj.variant,
          policy: { bands },
        }, outDir);
        rows.push(row);
        console.log("  -> " + row.changedPercent.toFixed(2) + "% changed (" + row.classification + ")");
      } catch (err) {
        const errMsg = err && err.message ? err.message : String(err);
        console.error("  ERROR: " + errMsg);
        if (failFast) throw err;
        rows.push({
          page: pageName, section: sectionName, classification: "error",
          changedPercent: -1, changedPixels: 0, totalPixels: 0, threshold,
          variant: specObj.variant || "mobile",
          diffOnlyPath: "", diffComparisonPath: "", leftRegionPath: "", rightRegionPath: "",
          artifactJson: "", leftSelector, rightSelector,
          styleChangeCount: 0, attributeChangeCount: 0,
          styleDiffs: [], attributeDiffs: [], bounds: {},
        });
      }
    }
  }

  const summary = buildSummary(rows);
  const summaryPath = pathMod.join(outDir, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log("\nWrote " + rows.length + " rows to " + summaryPath);
  console.log("Classifications: " + JSON.stringify(summary.classificationCounts));

  if (!summary.policy.ok) {
    console.log("FAIL: " + summary.policy.failureCount + " sections need attention (" + summary.policy.worstClassification + ")");
  } else {
    console.log("PASS: All sections within policy");
  }

  return summary;
}

__verb__("fromSpec", {
  parents: ["fringe", "review"],
  short: "Generate review-site data from fringe-intake.yaml spec",
  output: "structured",
  fields: {
    spec: { bind: "spec" },
    sweepOutput: { bind: "sweepOutput" },
  },
});

// ── Verb: summary ───────────────────────────────────────────────────────────

async function rebuildSummary(spec, sweepOutput) {
  const fs = require("fs");
  const pathMod = require("path");
  const yaml = require("yaml");

  const specText = fs.readFileSync(spec.specFile, "utf8");
  const specObj = yaml.parse(specText);
  const outDir = sweepOutput.outDir;

  const rows = [];
  for (const [pageName, pageSpec] of Object.entries(specObj.pages || {})) {
    for (const sectionName of Object.keys(pageSpec.sections || {})) {
      const comparePath = pathMod.join(outDir, pageName, "artifacts", sectionName, "compare.json");
      if (!fs.existsSync(comparePath)) {
        console.warn("Missing: " + comparePath);
        continue;
      }
      const data = JSON.parse(fs.readFileSync(comparePath, "utf8"));
      const row = buildRow(pageName, sectionName, data, {
        defaults: { threshold: specObj.defaults && specObj.defaults.threshold || 30 },
        variant: specObj.variant,
        policy: specObj.policy,
      }, outDir);
      rows.push(row);
    }
  }

  const s = buildSummary(rows);
  fs.writeFileSync(pathMod.join(outDir, "summary.json"), JSON.stringify(s, null, 2));
  console.log("Rebuilt summary: " + rows.length + " rows, " + JSON.stringify(s.classificationCounts));
  return s;
}

__verb__("rebuildSummary", {
  parents: ["fringe", "review"],
  short: "Rebuild summary.json from existing compare artifacts",
  output: "structured",
  fields: {
    spec: { bind: "spec" },
    sweepOutput: { bind: "sweepOutput" },
  },
});

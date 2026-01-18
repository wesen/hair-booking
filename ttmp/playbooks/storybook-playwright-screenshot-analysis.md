---
Title: Storybook Screenshot Capture and AI Analysis Playbook
Status: active
Topics:
    - frontend
    - react
    - storybook
    - playwright
    - visual-testing
DocType: playbook
Intent: long-term
Summary: "Reusable technique for capturing React component screenshots via Storybook/Playwright and analyzing them with AI agents"
LastUpdated: 2026-01-18
---

# Storybook Screenshot Capture and AI Analysis Playbook

## Purpose

A reusable technique for:
1. Rendering React components in Storybook
2. Capturing screenshots with Playwright
3. Analyzing visual differences with AI agents (pinocchio)
4. Generating comparison reports

This playbook can be applied to any React project using Storybook for component development.

---

## Prerequisites

### Required Tools

| Tool | Install Command | Purpose |
|------|-----------------|---------|
| Node.js 20+ | Via nvm | Runtime |
| Storybook 8+ | `npm install storybook` | Component rendering |
| Playwright | `npm install playwright` | Browser automation |
| Chromium | `npx playwright install chromium` | Headless browser |
| pinocchio | (system tool) | AI visual analysis |

### Project Requirements

```
your-project/
├── src/
│   └── components/
│       └── MyComponent.tsx
│       └── MyComponent.stories.tsx   # ← Required
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── package.json
```

---

## Part 1: Storybook Setup

### 1.1 Creating Stories

Every component needs a `.stories.tsx` file:

```tsx
// MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',  // ← Determines URL path
  component: MyComponent,
  parameters: {
    layout: 'fullscreen',  // or 'centered', 'padded'
  },
}

export default meta
type Story = StoryObj<typeof MyComponent>

// Each export becomes a story
export const Default: Story = {
  args: {
    prop1: 'value1',
  },
}

export const Variant: Story = {
  args: {
    prop1: 'different value',
  },
}
```

### 1.2 Running Storybook

```bash
# Development mode
npm run storybook
# Usually starts on http://localhost:6006

# Build static version (for CI)
npm run storybook:build
# Output in storybook-static/
```

### 1.3 Story URL Patterns

Storybook exposes stories at predictable URLs:

| Type | URL Pattern | Use Case |
|------|-------------|----------|
| Full UI | `http://localhost:6006/?path=/story/{story-id}` | Interactive |
| Iframe Only | `http://localhost:6006/iframe.html?id={story-id}&viewMode=story` | Screenshots |

**Story ID Format**: `{title}--{story-name}` in kebab-case

Examples:
- `title: 'Components/Button'` + `export const Primary` → `components-button--primary`
- `title: 'Pages/HomePage'` + `export const Default` → `pages-homepage--default`

---

## Part 2: Playwright Screenshot Capture

### 2.1 Basic Setup

Create a scripts directory:

```bash
mkdir -p scripts
```

### 2.2 Single Screenshot Script

```typescript
// scripts/capture-screenshot.ts
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CaptureOptions {
  storyId: string;
  outputPath: string;
  viewport?: { width: number; height: number };
  fullPage?: boolean;
  selector?: string;  // Optional: capture specific element
}

async function captureScreenshot(options: CaptureOptions): Promise<string> {
  const {
    storyId,
    outputPath,
    viewport = { width: 1920, height: 1080 },
    fullPage = true,
    selector,
  } = options;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;
  
  console.log(`📸 Capturing ${storyId}...`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait for animations

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  if (selector) {
    // Capture specific element
    const element = page.locator(selector).first();
    await element.screenshot({ path: outputPath });
  } else {
    // Capture full page or viewport
    await page.screenshot({ path: outputPath, fullPage });
  }

  await browser.close();
  console.log(`  ✓ Saved: ${outputPath}`);
  return outputPath;
}

// Example usage
async function main() {
  await captureScreenshot({
    storyId: 'components-button--primary',
    outputPath: path.join(__dirname, '../screenshots/button-primary.png'),
  });
}

main().catch(console.error);
```

### 2.3 Running the Script

```bash
# Ensure Storybook is running first!
npm run storybook &

# Run the capture script
npx tsx scripts/capture-screenshot.ts
```

### 2.4 Multi-Viewport Capture

```typescript
// scripts/capture-responsive.ts
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

async function captureResponsive(storyId: string, outputDir: string) {
  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    
    await page.goto(
      `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`,
      { waitUntil: 'networkidle' }
    );
    
    const outputPath = path.join(outputDir, `${storyId}-${vp.name}.png`);
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`✓ ${vp.name}: ${outputPath}`);
    
    await context.close();
  }

  await browser.close();
}
```

### 2.5 Batch Capture All Stories

```typescript
// scripts/capture-all-stories.ts
import { chromium } from 'playwright';

async function getAllStoryIds(): Promise<string[]> {
  const response = await fetch('http://localhost:6006/index.json');
  const data = await response.json();
  return Object.keys(data.entries).filter(id => 
    data.entries[id].type === 'story'
  );
}

async function captureAllStories(outputDir: string) {
  const storyIds = await getAllStoryIds();
  console.log(`Found ${storyIds.length} stories`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  for (const storyId of storyIds) {
    const page = await context.newPage();
    await page.goto(
      `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`,
      { waitUntil: 'networkidle' }
    );
    
    const safeName = storyId.replace(/[^a-z0-9-]/g, '-');
    await page.screenshot({
      path: path.join(outputDir, `${safeName}.png`),
      fullPage: true,
    });
    
    await page.close();
    console.log(`✓ ${storyId}`);
  }

  await browser.close();
}
```

---

## Part 3: Comparison Screenshots

### 3.1 Side-by-Side Capture

For comparing implementations (e.g., original HTML vs React):

```typescript
// scripts/compare-implementations.ts
interface ComparisonConfig {
  original: {
    url: string;
    selector?: string;
  };
  react: {
    storyId: string;
    selector?: string;
  };
  outputDir: string;
  viewport: { width: number; height: number };
}

async function captureComparison(config: ComparisonConfig) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: config.viewport });

  // Capture original
  const originalPage = await context.newPage();
  await originalPage.goto(config.original.url, { waitUntil: 'networkidle' });
  
  if (config.original.selector) {
    await originalPage.locator(config.original.selector).first()
      .screenshot({ path: path.join(config.outputDir, 'original.png') });
  } else {
    await originalPage.screenshot({ 
      path: path.join(config.outputDir, 'original.png'),
      fullPage: true 
    });
  }

  // Capture React
  const reactPage = await context.newPage();
  const storyUrl = `http://localhost:6006/iframe.html?id=${config.react.storyId}&viewMode=story`;
  await reactPage.goto(storyUrl, { waitUntil: 'networkidle' });
  
  if (config.react.selector) {
    await reactPage.locator(config.react.selector).first()
      .screenshot({ path: path.join(config.outputDir, 'react.png') });
  } else {
    await reactPage.screenshot({ 
      path: path.join(config.outputDir, 'react.png'),
      fullPage: true 
    });
  }

  await browser.close();
  console.log(`✓ Comparison saved to ${config.outputDir}`);
}
```

### 3.2 Extract Element Metadata

```typescript
async function extractElementInfo(page: Page, selector: string) {
  const element = page.locator(selector).first();
  
  const exists = await element.count() > 0;
  if (!exists) return { exists: false };

  const visible = await element.isVisible();
  if (!visible) return { exists: true, visible: false };

  const bounds = await element.boundingBox();
  
  const styles = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      padding: computed.padding,
      margin: computed.margin,
    };
  });

  return {
    exists: true,
    visible: true,
    bounds,
    styles,
  };
}
```

---

## Part 4: AI Analysis with Pinocchio

### 4.1 Basic Usage

The `pinocchio code professional` command accepts images and questions:

```bash
pinocchio code professional \
  --images image1.png,image2.png \
  "Your question about the images"
```

### 4.2 Effective Prompts

| Goal | Prompt Template |
|------|-----------------|
| Find missing content | "What sections appear in image 1 but are MISSING from image 2?" |
| Compare layouts | "Compare the layout of these two screenshots. Focus on: 1) spacing 2) alignment 3) proportions" |
| Identify style differences | "What are the typography and color differences between these two versions?" |
| Navigation comparison | "Compare the navigation bars. List differences in: menu items, icons, buttons" |

### 4.3 Scripted AI Analysis

```bash
#!/bin/bash
# scripts/analyze-screenshots.sh

SCREENSHOTS_DIR="./screenshots"
OUTPUT_FILE="./analysis-report.md"

echo "# Visual Analysis Report" > $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "Generated: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Compare full pages
echo "## Full Page Comparison" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

ANALYSIS=$(pinocchio code professional \
  --images "$SCREENSHOTS_DIR/original.png,$SCREENSHOTS_DIR/react.png" \
  "Compare these two website screenshots. List ALL visual differences including: layout, colors, typography, spacing, missing elements, and any other discrepancies.")

echo "$ANALYSIS" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Analyze specific sections
for section in header hero footer; do
  if [[ -f "$SCREENSHOTS_DIR/original-$section.png" && -f "$SCREENSHOTS_DIR/react-$section.png" ]]; then
    echo "## $section Section" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    
    SECTION_ANALYSIS=$(pinocchio code professional \
      --images "$SCREENSHOTS_DIR/original-$section.png,$SCREENSHOTS_DIR/react-$section.png" \
      "Compare these $section sections. What are the specific differences?")
    
    echo "$SECTION_ANALYSIS" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
  fi
done

echo "Report saved to $OUTPUT_FILE"
```

### 4.4 TypeScript Integration

```typescript
// scripts/ai-analyze.ts
import { execSync } from 'child_process';

interface AnalysisResult {
  question: string;
  images: string[];
  response: string;
}

function analyzeWithPinocchio(
  images: string[],
  question: string
): AnalysisResult {
  const imageArg = images.join(',');
  
  const response = execSync(
    `pinocchio code professional --images "${imageArg}" "${question}"`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
  );

  return {
    question,
    images,
    response: response.trim(),
  };
}

// Usage
const result = analyzeWithPinocchio(
  ['./screenshots/original.png', './screenshots/react.png'],
  'What content is missing from the second image?'
);

console.log(result.response);
```

### 4.5 Best Practices for AI Analysis

| ✅ Do | ❌ Don't |
|-------|----------|
| Ask specific, focused questions | Ask vague "what's different?" |
| Compare similar-sized sections | Compare tiny vs huge images |
| Verify critical findings manually | Trust AI for pixel-perfect accuracy |
| Use for broad categorization | Rely on for CSS value extraction |
| Chain multiple focused questions | Ask everything in one prompt |

### 4.6 Combining Playwright Data + AI Analysis

```typescript
async function comprehensiveAnalysis(
  originalUrl: string,
  storyId: string,
  sections: Array<{ selector: string; name: string }>
) {
  const results = [];

  // 1. Capture screenshots and extract metadata
  for (const section of sections) {
    const originalMeta = await extractElementInfo(originalPage, section.selector);
    const reactMeta = await extractElementInfo(reactPage, section.selector);

    // 2. Use Playwright for quantitative comparison
    const quantitativeIssues = [];
    if (!reactMeta.exists && originalMeta.exists) {
      quantitativeIssues.push(`MISSING: ${section.name} not found in React`);
    }
    if (originalMeta.bounds && reactMeta.bounds) {
      const heightDiff = Math.abs(originalMeta.bounds.height - reactMeta.bounds.height);
      if (heightDiff > 10) {
        quantitativeIssues.push(`HEIGHT: ${heightDiff}px difference`);
      }
    }

    // 3. Use AI for qualitative comparison (only if screenshots exist)
    let qualitativeAnalysis = '';
    if (originalMeta.visible && reactMeta.visible) {
      qualitativeAnalysis = analyzeWithPinocchio(
        [`screenshots/original-${section.name}.png`, `screenshots/react-${section.name}.png`],
        `Compare these ${section.name} sections. What visual differences do you see?`
      ).response;
    }

    results.push({
      section: section.name,
      quantitative: quantitativeIssues,
      qualitative: qualitativeAnalysis,
    });
  }

  return results;
}
```

---

## Part 5: Complete Workflow

### 5.1 Setup Phase

```bash
# 1. Install dependencies
cd your-project
npm install playwright
npx playwright install chromium

# 2. Create scripts directory
mkdir -p scripts screenshots
```

### 5.2 Capture Phase

```bash
# 1. Start Storybook
npm run storybook &
sleep 10  # Wait for startup

# 2. (Optional) Start server for original HTML
cd original-templates && python3 -m http.server 8080 &
cd ..

# 3. Run capture script
npx tsx scripts/capture-comparison.ts
```

### 5.3 Analysis Phase

```bash
# 1. Run Playwright comparison (quantitative)
npx tsx scripts/analyze-dimensions.ts > reports/playwright-analysis.json

# 2. Run AI analysis (qualitative)
./scripts/analyze-screenshots.sh

# 3. Generate combined report
npx tsx scripts/generate-report.ts
```

### 5.4 CI Integration

```yaml
# .github/workflows/visual-test.yml
name: Visual Regression

on: [pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install chromium
        
      - name: Build Storybook
        run: npm run storybook:build
        
      - name: Start Storybook
        run: npx serve storybook-static -p 6006 &
        
      - name: Wait for Storybook
        run: npx wait-on http://localhost:6006
        
      - name: Capture screenshots
        run: npx tsx scripts/capture-all-stories.ts
        
      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: screenshots/
```

---

## Quick Reference

### Commands

```bash
# Start Storybook
npm run storybook

# Install Playwright browser
npx playwright install chromium

# Capture single screenshot
npx tsx scripts/capture-screenshot.ts

# Run comparison
npx tsx scripts/compare-implementations.ts

# AI analysis
pinocchio code professional --images img1.png,img2.png "Your question"

# List all story IDs
curl http://localhost:6006/index.json | jq '.entries | keys'
```

### Story URL Template

```
http://localhost:6006/iframe.html?id={story-id}&viewMode=story
```

### Viewport Presets

| Name | Width | Height |
|------|-------|--------|
| Mobile | 375 | 667 |
| Tablet | 768 | 1024 |
| Desktop | 1920 | 1080 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Executable doesn't exist" | `npx playwright install chromium` |
| "__dirname not defined" | Add ESM shim (see Part 2.2) |
| Blank screenshots | Increase `waitForTimeout()` |
| Story not found | Check story ID format (kebab-case) |
| pinocchio hangs | Check image paths are correct |

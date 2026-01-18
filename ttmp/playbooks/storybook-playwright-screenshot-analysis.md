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
Summary: "Reusable technique for capturing React component screenshots via Storybook/Playwright, comparing CSS computed styles, and analyzing them with AI agents"
LastUpdated: 2026-01-18
---

# Storybook Screenshot Capture and AI Analysis Playbook

## Purpose

A reusable technique for:
1. Rendering React components in Storybook
2. Capturing screenshots with Playwright
3. **Comparing computed CSS styles between implementations**
4. Analyzing visual differences with AI agents (pinocchio)
5. Generating comparison reports
6. **Debugging CSS issues with the compare-css.ts script**

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
| tsx | `npm install tsx` | TypeScript execution |

### Project Requirements

```
your-project/
├── src/
│   └── components/
│       └── MyComponent.tsx
│       └── MyComponent.stories.tsx   # ← Required
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── preview-head.html              # ← For CSS overrides
├── scripts/
│   ├── compare-about-us.ts            # ← Visual comparison
│   └── compare-css.ts                 # ← CSS debugging
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
```

### 1.2 Running Storybook

```bash
# Development mode
npm run storybook
# Usually starts on http://localhost:6006

# Build static version (for CI)
npm run storybook:build
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

### 1.4 CSS Loading in Storybook

**CRITICAL**: Storybook loads CSS from `.storybook/preview-head.html`. If your React components need CSS overrides, add them here:

```html
<!-- .storybook/preview-head.html -->
<link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="/assets/css/style.css" />

<style>
/* React-specific CSS overrides go here */
/* These fix issues where original CSS selectors don't work with React structure */

.page-with-hero #page-title {
  margin-top: -140px;
  position: relative;
  z-index: 1;
}
</style>
```

---

## Part 2: Playwright Screenshot Capture

### 2.1 Basic Setup

```bash
mkdir -p scripts
npm install playwright
npx playwright install chromium
```

### 2.2 Single Screenshot Script

```typescript
// scripts/capture-screenshot.ts
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ESM module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot(storyId: string, outputPath: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations/images
  
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`✓ Saved: ${outputPath}`);
  
  await browser.close();
}
```

### 2.3 Running Screenshots

```bash
# Ensure Storybook is running first!
npm run storybook &
sleep 10

# Run the capture script
npx tsx scripts/capture-screenshot.ts

# Or use Playwright CLI directly
npx playwright screenshot --full-page --wait-for-timeout=3000 \
  'http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story' \
  screenshot.png
```

### 2.4 Capturing Specific Elements

```typescript
// Capture just the hero section
const element = await page.$('#page-title');
if (element) {
  await element.screenshot({ path: 'hero-section.png' });
}
```

---

## Part 3: CSS Computed Styles Comparison

**This is the most valuable debugging technique discovered.**

### 3.1 The Problem

When porting HTML to React, CSS often breaks because:
- Adjacent sibling selectors don't work (`.header + .content`)
- React wrappers add extra DOM levels
- Class names may differ
- CSS isn't loaded in the same order

### 3.2 CSS Comparison Script

Create `scripts/compare-css.ts`:

```typescript
import { chromium } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINAL_URL = 'http://localhost:8080/page.html';
const REACT_URL = 'http://localhost:6006/iframe.html?id=pages-mypage--default&viewMode=story';

async function getElementInfo(page: any, selector: string) {
  return await page.evaluate((sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    return {
      exists: true,
      bounds: { 
        width: rect.width, 
        height: rect.height, 
        top: rect.top, 
        left: rect.left 
      },
      computedStyles: {
        display: styles.display,
        position: styles.position,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        height: styles.height,
        minHeight: styles.minHeight,
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        backgroundSize: styles.backgroundSize,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
        zIndex: styles.zIndex,
      },
    };
  }, selector);
}

async function main() {
  const browser = await chromium.launch();
  const originalPage = await browser.newPage();
  const reactPage = await browser.newPage();

  await originalPage.goto(ORIGINAL_URL, { waitUntil: 'networkidle' });
  await reactPage.goto(REACT_URL, { waitUntil: 'networkidle' });
  await reactPage.waitForTimeout(3000);

  const selectors = [
    { name: 'Hero Section', selector: '#page-title' },
    { name: 'Title', selector: '.title--heading h1' },
    { name: 'Header', selector: 'header' },
  ];

  console.log('CSS COMPARISON REPORT');
  console.log('='.repeat(60));

  for (const { name, selector } of selectors) {
    console.log(`\n### ${name} (${selector})`);
    
    const original = await getElementInfo(originalPage, selector);
    const react = await getElementInfo(reactPage, selector);

    if (!original) { console.log('  ❌ NOT FOUND in original'); continue; }
    if (!react) { console.log('  ❌ NOT FOUND in React'); continue; }

    // Compare dimensions
    console.log(`  📐 Original: ${original.bounds.width}x${original.bounds.height}`);
    console.log(`  📐 React:    ${react.bounds.width}x${react.bounds.height}`);

    // Compare key styles
    const stylesToCheck = ['position', 'marginTop', 'height', 'zIndex'];
    for (const prop of stylesToCheck) {
      const orig = original.computedStyles[prop];
      const curr = react.computedStyles[prop];
      if (orig !== curr) {
        console.log(`  ✗ ${prop}: Original="${orig}" React="${curr}"`);
      }
    }
  }

  await browser.close();
}

main().catch(console.error);
```

### 3.3 Running the Comparison

```bash
# Start both servers
cd original-html && python3 -m http.server 8080 &
npm run storybook &
sleep 10

# Run comparison
npx tsx scripts/compare-css.ts
```

### 3.4 Interpreting Results

```
### Hero Section (#page-title)
  📐 Original: 1280x466
  📐 React:    1280x1336      ← HEIGHT MISMATCH!
  
  ✗ position: Original="relative" React="static"
  ✗ marginTop: Original="-140px" React="0px"
  ✗ zIndex: Original="1" React="auto"
```

This tells you exactly which CSS properties to fix.

---

## Part 4: Common CSS Issues and Fixes

### 4.1 Adjacent Sibling Selector Broken

**Original CSS:**
```css
.header-transparent + .page-title {
  margin-top: -140px;
}
```

**Problem:** React wraps content in `<main>` or other elements, breaking `+` selector.

**Fix in preview-head.html:**
```css
.page-with-hero #page-title {
  margin-top: -140px;
  position: relative;
}
```

### 4.2 Background Image via `<img>` Instead of CSS

**Original CSS expects:**
```css
.bg-section {
  background-image: url(...);
  background-size: cover;
}
```

**React uses:**
```tsx
<div className="bg-section">
  <img src={...} />
</div>
```

**Fix:**
```css
.bg-section {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.bg-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 4.3 CSS Not Loading in Storybook

**Symptom:** Styles work in dev but not Storybook.

**Fix:** Add CSS links to `.storybook/preview-head.html`:
```html
<link rel="stylesheet" href="/path/to/styles.css" />
```

---

## Part 5: AI Analysis with Pinocchio

### 5.1 Basic Usage

```bash
pinocchio code professional \
  --images original.png,react.png \
  "Your question about the images"
```

### 5.2 Effective Prompts

| Goal | Prompt Template |
|------|-----------------|
| Find missing content | "What sections appear in image 1 but are MISSING from image 2?" |
| Compare layouts | "Compare the layout of these two screenshots. Focus on spacing, alignment, proportions" |
| Identify differences | "What are the typography and color differences between these two versions?" |
| Verify fix | "How close is the React version (image 2) to the original (image 1) now?" |

### 5.3 Strengths and Limitations

| ✅ Good For | ❌ Not Good For |
|-------------|-----------------|
| Identifying missing sections | Pixel-perfect accuracy |
| Broad layout differences | Exact CSS values |
| Quick sanity checks | Definitive proof |
| Getting fresh perspective | Replacing compare-css.ts |

### 5.4 Best Practice: Combine Both

1. Use **pinocchio** for initial exploration: "What's different?"
2. Use **compare-css.ts** to get exact property values
3. Fix the CSS
4. Use **pinocchio** to verify: "How close is it now?"

---

## Part 6: Complete Workflow

### 6.1 Setup Phase

```bash
# Install dependencies
npm install playwright
npx playwright install chromium

# Create scripts directory
mkdir -p scripts
```

### 6.2 Discovery Phase

```bash
# Start both servers
cd original-html && python3 -m http.server 8080 &
npm run storybook &

# Take initial screenshots
npx playwright screenshot --full-page \
  'http://localhost:8080/page.html' original.png
npx playwright screenshot --full-page --wait-for-timeout=3000 \
  'http://localhost:6006/iframe.html?id=pages-mypage--default&viewMode=story' react.png

# Get AI overview
pinocchio code professional --images original.png,react.png \
  "What are the major visual differences between these two pages?"
```

### 6.3 Debugging Phase

```bash
# Run CSS comparison
npx tsx scripts/compare-css.ts

# Identify which properties differ
# Fix CSS in preview-head.html or component styles
```

### 6.4 Verification Phase

```bash
# Re-run comparison
npx tsx scripts/compare-css.ts

# Verify dimensions match
# Take new screenshots
# Use pinocchio to confirm fix
```

---

## Quick Reference

### Commands

```bash
# Start Storybook
npm run storybook

# Start original HTML server
python3 -m http.server 8080

# Install Playwright browser
npx playwright install chromium

# Single screenshot with wait
npx playwright screenshot --full-page --wait-for-timeout=3000 \
  'http://localhost:6006/iframe.html?id=story-id&viewMode=story' output.png

# Run comparison scripts
npx tsx scripts/compare-css.ts
npx tsx scripts/compare-about-us.ts

# AI analysis
pinocchio code professional --images img1.png,img2.png "Your question"
```

### Story URL Template

```
http://localhost:6006/iframe.html?id={story-id}&viewMode=story
```

### Key Files

| File | Purpose |
|------|---------|
| `.storybook/preview-head.html` | CSS loading and overrides |
| `scripts/compare-css.ts` | CSS property comparison |
| `scripts/compare-about-us.ts` | Full visual comparison |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Executable doesn't exist" | `npx playwright install chromium` |
| "__dirname not defined" | Add ESM shim with `fileURLToPath(import.meta.url)` |
| Blank/loading screenshots | Increase `waitForTimeout()` to 3000+ |
| Story not found | Check story ID format (kebab-case) |
| CSS not applying | Check preview-head.html loads CSS |
| Adjacent sibling broken | Use direct class selector instead |
| Background image wrong | Add absolute positioning + object-fit |

---

## Files to Copy to New Projects

1. **`scripts/compare-css.ts`** - The CSS debugging workhorse
2. **`.storybook/preview-head.html`** - Template for CSS overrides
3. **This playbook** - Reference documentation


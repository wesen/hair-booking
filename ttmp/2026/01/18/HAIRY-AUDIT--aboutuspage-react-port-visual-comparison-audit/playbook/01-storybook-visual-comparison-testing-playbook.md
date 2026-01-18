---
Title: Storybook Visual Comparison Testing Playbook
Ticket: HAIRY-AUDIT
Status: active
Topics:
    - frontend
    - react
    - storybook
DocType: playbook
Intent: long-term
Owners: []
RelatedFiles:
    - ui/scripts/compare-about-us.ts:Main comparison script
    - ui/package.json:Contains playwright and storybook dependencies
    - ui/.storybook/preview-head.html:CSS loading for Storybook
ExternalSources: []
Summary: "How to use Storybook with Playwright for visual comparison testing"
LastUpdated: 2026-01-18T18:10:00.000000000-05:00
---

# Storybook Visual Comparison Testing Playbook

## Purpose

This playbook documents how to:
1. Render React components in Storybook
2. Use Playwright to capture screenshots
3. Compare React implementations against original HTML templates
4. Generate visual diff reports

## Environment Assumptions

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.x | Runtime |
| Bun/npm | Latest | Package manager |
| Playwright | 1.57.0+ | Browser automation |
| Storybook | 10.x | Component rendering |
| Python 3 | 3.x | Simple HTTP server for HTML |

### Project Structure

```
project/
├── ui/
│   ├── src/
│   │   ├── components/
│   │   │   └── sections/
│   │   │       └── *.tsx          # React components
│   │   │       └── *.stories.tsx  # Storybook stories
│   │   └── pages/
│   │       └── *.tsx
│   │       └── *.stories.tsx
│   ├── scripts/
│   │   └── compare-*.ts           # Comparison scripts
│   ├── .storybook/
│   │   ├── main.ts
│   │   ├── preview.ts
│   │   └── preview-head.html      # CSS injection
│   └── public/
│       └── hairy/assets/          # Static assets
└── assets/
    └── Hairy/                     # Original HTML templates
```

---

## Procedure 1: Start Services

### Step 1.1: Start Storybook

```bash
cd ui
npm run storybook
# or
bun run storybook
```

**Expected Output:**
```
╭──────────────────────────────────────────────────────────────╮
│                                                              │
│   Storybook 10.x.x started                                   │
│   ...seconds                                                 │
│                                                              │
│   Local:            http://localhost:6006/                   │
│   On your network:  http://192.168.x.x:6006/                 │
│                                                              │
╰──────────────────────────────────────────────────────────────╯
```

### Step 1.2: Start Original HTML Server

In a separate terminal:

```bash
cd assets/Hairy
python3 -m http.server 8080
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8080 ...
```

### Step 1.3: Verify Both Services

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
# Should return: 200

curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/page-about-us.html
# Should return: 200
```

---

## Procedure 2: Install Playwright

### Step 2.1: Install Dependencies

```bash
cd ui
npm install playwright
# or already in devDependencies
```

### Step 2.2: Install Browser

```bash
npx playwright install chromium
```

**Expected Output:**
```
Downloading Chromium 143.x (playwright build vXXXX)...
Chromium 143.x downloaded to ~/.cache/ms-playwright/chromium-XXXX
```

---

## Procedure 3: Access Storybook Stories

### Understanding Storybook URLs

Storybook provides two ways to access stories:

| Type | URL Pattern | Use Case |
|------|-------------|----------|
| Full UI | `http://localhost:6006/?path=/story/{story-id}` | Interactive browsing |
| Iframe Only | `http://localhost:6006/iframe.html?id={story-id}&viewMode=story` | Screenshot capture |

### Finding Story IDs

Story IDs follow the pattern: `{title}--{story-name}` in kebab-case.

**Example Story:**
```tsx
// AboutUsPage.stories.tsx
const meta: Meta<typeof AboutUsPage> = {
  title: 'Pages/AboutUsPage',  // → "pages-aboutuspage"
  ...
}

export const FullPage: Story = { ... }  // → "--full-page"
```

**Resulting ID:** `pages-aboutuspage--full-page`

**URL:** `http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story`

### Listing All Stories

```bash
# Via Storybook API (when running)
curl http://localhost:6006/index.json | jq '.entries | keys'
```

---

## Procedure 4: Capture Screenshots with Playwright

### Step 4.1: Basic Screenshot Script

Create `ui/scripts/screenshot.ts`:

```typescript
import { chromium } from 'playwright';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot(storyId: string, outputName: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 } 
  });
  const page = await context.newPage();
  
  const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait for animations
  
  await page.screenshot({ 
    path: path.join(__dirname, `../screenshots/${outputName}.png`),
    fullPage: true 
  });
  
  console.log(`Screenshot saved: ${outputName}.png`);
  await browser.close();
}

captureScreenshot('pages-aboutuspage--full-page', 'about-us-page');
```

### Step 4.2: Run the Script

```bash
cd ui
npx tsx scripts/screenshot.ts
```

### Step 4.3: Capture Component Screenshots

```typescript
// Capture a specific element instead of full page
async function captureElement(storyId: string, selector: string, outputName: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const element = page.locator(selector);
  await element.screenshot({ path: `screenshots/${outputName}.png` });
  
  await browser.close();
}

// Usage
captureElement('sections-countersection--default', '.counter', 'counter-section');
```

---

## Procedure 5: Compare Original vs React

### Step 5.1: Full Comparison Script

See `ui/scripts/compare-about-us.ts` for a complete example that:

1. Opens both pages in parallel
2. Compares sections by selector
3. Extracts computed styles
4. Calculates dimension differences
5. Generates report

### Step 5.2: Run Comparison

```bash
cd ui
npx tsx scripts/compare-about-us.ts
```

**Expected Output:**
```
🔍 Starting AboutUsPage Visual Comparison Audit

📄 Loading original HTML template...
  ✓ Original page loaded
📄 Loading React Storybook version...
  ✓ React Storybook page loaded

📸 Capturing full page screenshots...
  ✓ Original: .../full-page-original.png
  ✓ React: .../full-page-react.png

🔬 Comparing sections...
  ✓ page-title-heading
  ✗ testimonials-section
      └─ HEIGHT MISMATCH: Original: 465px, React: 1401px

📝 Generating report...
📄 Report saved to: .../visual-audit-report.md

✅ Comparison complete!
   10 issue(s) found across 6 section(s)
```

---

## Procedure 6: Viewport Testing

### Step 6.1: Multiple Viewports

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const vp of viewports) {
  const context = await browser.newContext({ 
    viewport: { width: vp.width, height: vp.height } 
  });
  const page = await context.newPage();
  await page.goto(storyUrl);
  await page.screenshot({ 
    path: `screenshots/${storyName}-${vp.name}.png`,
    fullPage: true 
  });
}
```

---

## Procedure 7: Integrate with CI

### GitHub Actions Example

```yaml
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
        run: cd ui && npm ci
        
      - name: Install Playwright
        run: cd ui && npx playwright install chromium
        
      - name: Build Storybook
        run: cd ui && npm run storybook:build
        
      - name: Serve Storybook
        run: npx serve ui/storybook-static -p 6006 &
        
      - name: Wait for Storybook
        run: npx wait-on http://localhost:6006
        
      - name: Run visual tests
        run: cd ui && npx tsx scripts/compare-about-us.ts
        
      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff-screenshots
          path: ttmp/**/sources/*.png
```

---

## Procedure 8: Chromatic Integration (Alternative)

For automated visual testing, consider Chromatic:

### Step 8.1: Install Chromatic

```bash
npm install --save-dev chromatic
```

### Step 8.2: Publish to Chromatic

```bash
npx chromatic --project-token=<your-token>
```

Chromatic provides:
- Automatic baseline management
- Visual diff detection
- Review workflow
- Component documentation

---

## Troubleshooting

### Issue: "Executable doesn't exist"

**Symptom:**
```
browserType.launch: Executable doesn't exist at ~/.cache/ms-playwright/...
```

**Solution:**
```bash
npx playwright install chromium
```

### Issue: ESM __dirname not defined

**Symptom:**
```
ReferenceError: __dirname is not defined in ES module scope
```

**Solution:**
```typescript
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### Issue: Storybook iframe blank

**Symptom:** Screenshot shows blank page

**Solutions:**
1. Increase wait time: `await page.waitForTimeout(2000)`
2. Wait for specific element: `await page.waitForSelector('.my-component')`
3. Check story ID is correct

### Issue: CSS not loading in Storybook

**Check:** `.storybook/preview-head.html` contains:
```html
<link rel="stylesheet" href="/hairy/assets/css/external.css" />
<link rel="stylesheet" href="/hairy/assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="/hairy/assets/css/style.css" />
```

---

## Exit Criteria

Visual comparison is complete when:

- [ ] Both services running (Storybook + original HTML server)
- [ ] Playwright installed with Chromium
- [ ] Full page screenshots captured for both versions
- [ ] Section-by-section comparison completed
- [ ] Report generated with issues documented
- [ ] Screenshots saved for evidence

---

## Procedure 9: AI-Assisted Visual Analysis with Pinocchio

For detailed visual analysis questions, use the `pinocchio` CLI to offload image comparison to an AI model.

### Step 9.1: Basic Image Comparison

```bash
pinocchio code professional --images original.png,react.png "Compare these two screenshots"
```

### Step 9.2: Focused Questions

```bash
# Ask about missing sections
pinocchio code professional --images original.png,react.png \
  "What sections appear in image 1 but are MISSING from image 2?"

# Ask about specific components
pinocchio code professional --images header-original.png,header-react.png \
  "Compare these navigation bars. What are the differences in: 1) Menu items 2) Layout 3) Styling"
```

### Step 9.3: Best Practices

| Do | Don't |
|----|-------|
| Ask specific, focused questions | Ask vague "what's different" questions |
| Compare similar sections | Compare full pages for detailed analysis |
| Verify findings manually | Blindly trust all observations |
| Use for broad categorization | Rely on for pixel-perfect accuracy |

**Note**: The AI may hallucinate some details. Always verify critical findings with actual code/CSS inspection.

---

## Quick Reference Commands

```bash
# Start services
cd ui && npm run storybook &
cd assets/Hairy && python3 -m http.server 8080 &

# Install playwright
cd ui && npx playwright install chromium

# Run comparison
cd ui && npx tsx scripts/compare-about-us.ts

# Single screenshot
cd ui && npx playwright screenshot http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page screenshot.png

# Build static storybook
cd ui && npm run storybook:build

# AI-assisted visual analysis
pinocchio code professional --images img1.png,img2.png "Your question here"
```

---
Title: Template Porting Workflow Analysis
Ticket: MO-013-DESIGN-TEMPLATE-TACTIC
Status: active
Topics:
    - template-porting
    - react
    - storybook
    - playwright
    - css-debugging
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: ttmp/2026/01/18/2026-01-18-assets-analysis--assets-template-analysis/design-doc/02-react-rtk-toolkit-port-plan-about-us-first.md
      Note: Prior porting strategy and scope
    - Path: ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/design-doc/02-css-architecture-analysis-and-recommendations.md
      Note: CSS architecture mismatch findings
    - Path: ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/playbook/01-storybook-visual-comparison-testing-playbook.md
      Note: Storybook + Playwright workflow reference
    - Path: ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/reference/01-diary.md
      Note: Diary with tool usage and pain points
    - Path: ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/reference/03-visual-analysis-report-component-by-component.md
      Note: Component-by-component visual analysis
    - Path: ui/scripts/capture-sections.ts
      Note: Section screenshot capture script
    - Path: ui/scripts/compare-about-us.ts
      Note: Primary full-page visual comparison script
    - Path: ui/scripts/compare-css.ts
      Note: Computed-style diff script referenced in analysis
ExternalSources: []
Summary: Comprehensive analysis of template porting workflow, tooling, and pain points from Hairy HTML -> React efforts, with detailed findings and a standardized workflow recommendation.
LastUpdated: 2026-01-19
WhatFor: Consolidate lessons learned from prior template porting efforts and set a roadmap for a standardized, efficient workflow.
WhenToUse: Use when designing or improving the HTML template -> React porting process and tooling.
---


# Template Porting Workflow Analysis

## Executive Summary

The Hairy HTML -> React porting work reveals a repeatable but challenging workflow. The core loop is: **Inventory -> Plan -> Implement -> Visual Audit -> CSS Debug -> Manual Review -> Fix -> Repeat**. 

Key learnings:
- **CSS architecture is the biggest pain point.** Template CSS assumes specific DOM structures (adjacent sibling selectors, nested classes) that break when React components restructure the DOM.
- **Storybook is essential but requires careful CSS configuration.** Missing CSS imports in `preview-head.html` caused hours of false-negative debugging.
- **Three tiers of validation are needed:** automated full-page comparison, computed-style diffing, and manual screenshot inspection.
- **Plugin replacements are non-trivial.** jQuery plugins (Owl Carousel, Magnific Popup) require React equivalents (Embla, React portals).
- **Asset paths break silently.** Icons and images fail to render without visible errors unless explicitly checked.

The AboutUsPage port achieved ~70% visual fidelity but has critical regressions: testimonials content invisible, counter icons broken, video play button missing, typography inconsistencies throughout.

---

## Problem Statement

Template ports from static HTML/CSS to React require:
1. **Structural translation** - HTML sections become React components with props
2. **Style preservation** - CSS must render identically despite different DOM structure
3. **Behavioral parity** - jQuery plugins become React state/effects
4. **Asset integrity** - All images, icons, and fonts must load correctly

In practice, each of these layers introduces bugs that compound. CSS rules that worked in the original fail silently in React. Plugins that animated smoothly become static or missing. Images that displayed perfectly show as broken squares.

Without a systematic workflow and debugging toolkit, each port rediscovers the same problems, wasting time and introducing regressions.

---

## Detailed Workflow

### Phase 1: Inventory

**Goal:** Complete catalog of all pages, sections, and components in the template.

**Process:**
1. List all HTML pages in the template (`assets/Hairy/*.html`)
2. For each page, identify major sections by their container IDs/classes
3. Create a section-to-component mapping table
4. Note any jQuery plugins used (look for `data-*` attributes, plugin-specific classes)
5. Identify shared components (header, footer, navigation)

**Example Output (AboutUsPage):**

| Section | Original Selector | React Component | Status |
|---------|------------------|-----------------|--------|
| Header | `header.header` | `Header` | Partial |
| Page Title | `#page-title` | `PageTitleSection` | Good |
| Video | `#video2` | `VideoSection` | Poor |
| Counter | `#counter1` | `CounterSection` | Poor |
| Team | `#team1` | `TeamSection` | Fair |
| Testimonials | `#testimonial2` | `TestimonialsSection` | Critical |
| Blog Grid | `#blog` | `BlogGridSection` | Fair |
| Footer | `footer.footer` | `Footer` | Good |

**Artifacts:**
- Template inventory spreadsheet/markdown table
- Section ID mapping
- Plugin dependency list

---

### Phase 2: Planning

**Goal:** Define scope, component architecture, and data flow.

**Key Decisions:**
1. **Data extraction strategy** - Where does section content come from?
   - Option A: Hardcoded in component (quick, not reusable)
   - Option B: Props from parent (flexible, testable)
   - Option C: Redux store (for dynamic/shared data)
   
2. **CSS strategy** - How to handle template styles?
   - Option A: Import global CSS as-is (fastest, most fragile)
   - Option B: CSS Modules per component (cleanest, most work)
   - Option C: Tailwind recreation (best long-term, highest upfront cost)
   
3. **Plugin replacement mapping** - What React libraries replace jQuery plugins?

**Plugin Replacement Registry:**

| jQuery Plugin | Purpose | React Replacement | Notes |
|---------------|---------|-------------------|-------|
| Owl Carousel | Carousels/sliders | `embla-carousel-react` | Requires custom dot navigation |
| Magnific Popup | Lightboxes | `react-image-lightbox` or portals | Video popups need YouTube embed |
| WOW.js | Scroll animations | `react-intersection-observer` + CSS | Or Framer Motion |
| jQuery Validate | Form validation | React Hook Form | Built-in or Zod |
| Isotope/Masonry | Grid layouts | CSS Grid or `react-masonry-css` | Often CSS-only works |
| Waypoints | Scroll triggers | Intersection Observer API | Native browser API |
| CountUp | Number animation | `react-countup` | Direct port available |

---

### Phase 3: Implementation

**Goal:** Build React components with Storybook stories.

**Per-Component Workflow:**

1. **Create component file** (`ui/src/components/sections/SectionName.tsx`)
2. **Extract HTML structure** from original template
3. **Convert to JSX** (className, self-closing tags, etc.)
4. **Define props interface** for variable content
5. **Create Storybook story** with realistic data
6. **Test in isolation** before page integration

**Critical Storybook Configuration:**

```html
<!-- ui/.storybook/preview-head.html -->
<!-- MUST include all CSS the components need -->
<link rel="stylesheet" href="/hairy/assets/css/vendor/bootstrap.min.css" />
<link rel="stylesheet" href="/hairy/assets/css/vendor/all.min.css" />
<link rel="stylesheet" href="/hairy/assets/css/main.css" />
<link rel="stylesheet" href="/src/styles/theme.css" />  <!-- React overrides -->
```

**Common JSX Conversion Issues:**

| HTML | JSX | Notes |
|------|-----|-------|
| `class=` | `className=` | Standard React |
| `for=` | `htmlFor=` | Label attribute |
| `<img>` | `<img />` | Self-closing |
| `style="..."` | `style={{...}}` | Object syntax |
| `<!-- comment -->` | `{/* comment */}` | JSX comments |
| `data-*` attributes | Same, but no plugin behavior | Manual implementation needed |
| Adjacent siblings | May need wrapper `<div>` | Breaks CSS selectors |

---

### Phase 4: Visual Audit

**Goal:** Systematically compare React output to original HTML.

**Three-Tier Validation:**

#### Tier 1: Full-Page Comparison Script

```bash
cd ui && npx tsx scripts/compare-about-us.ts
```

**What it does:**
- Launches Playwright browser
- Visits original HTML (localhost:8080) and Storybook story (localhost:6006)
- Captures full-page screenshots
- Captures per-section screenshots
- Compares dimensions, generates report

**Output:**
- `sources/about-us-comparison/original-full.png`
- `sources/about-us-comparison/react-full.png`
- `sources/about-us-comparison/comparison-report.md`
- `sources/about-us-comparison/comparison-results.json`

**Key Metrics:**
- Page height difference (indicates missing sections)
- Section count (both should match)
- Per-section dimensions (height/width matching)

#### Tier 2: Computed Style Comparison

```bash
cd ui && npx tsx scripts/compare-css.ts
```

**What it does:**
- Visits both pages
- For each target selector, extracts computed CSS properties
- Compares specific properties (margin, padding, position, height, etc.)
- Reports differences

**Most Revealing Properties:**
- `position` - static vs relative/absolute catches layout issues
- `margin-top` - negative margins for overlays
- `height` - wrong height = content not rendering
- `z-index` - content hidden behind other elements
- `display` - none = content explicitly hidden
- `visibility` - hidden = takes space but invisible

**Example Finding:**
```
#page-title:
  Original: position=relative, margin-top=-140px, height=466px
  React:    position=static,   margin-top=0px,    height=1336px
  
  Root cause: Adjacent sibling selector .header-transparent + .page-title 
              not matching because <main> wrapper inserted between header and section
```

#### Tier 3: Manual Screenshot Inspection

```bash
cd ui && npx tsx scripts/capture-sections.ts
```

**What it does:**
- Captures individual section screenshots from both versions
- Saves to `sources/visual-analysis/` for manual review

**What to look for:**
- Typography: Is text italic/bold where expected?
- Icons: Do SVG/PNG icons render correctly?
- Overlays: Are play buttons, hover states visible?
- Spacing: Does vertical rhythm match?
- Colors: Are accent colors correct?
- Images: Are background images positioned correctly?

---

### Phase 5: CSS Debugging

**Goal:** Fix CSS mismatches identified in visual audit.

**Common CSS Failure Modes:**

#### 1. Adjacent Sibling Selector Breakage

**Problem:** CSS rule `.header + .page-title` doesn't match when React adds wrapper elements.

```css
/* Original: works because header is immediately followed by .page-title */
.header-transparent + .page-title {
    margin-top: -140px;
}

/* React: FAILS because structure is now header > main > .page-title */
```

**Solution:** Add explicit override in `theme.css`:
```css
.page-with-hero #page-title {
    margin-top: -140px;
    position: relative;
}
```

#### 2. Background Image Semantics

**Problem:** Original uses `background-image` CSS property; React component uses `<img>` tag.

```css
/* Original: background-image fills container naturally */
.bg-section {
    background-size: cover;
    background-position: center;
}

/* React: <img> inside .bg-section needs explicit styling */
.bg-section img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
}
```

#### 3. Storybook CSS Loading Order

**Problem:** Component CSS depends on vendor CSS loaded first, but Storybook doesn't automatically include it.

**Symptom:** Component looks completely different in Storybook vs. main app.

**Solution:** Explicit CSS links in `.storybook/preview-head.html` in correct order:
1. Vendor CSS (Bootstrap, Font Awesome)
2. Template main CSS
3. React override CSS (theme.css)

#### 4. Missing Plugin Classes

**Problem:** jQuery plugins add classes dynamically (e.g., `.owl-loaded`, `.animated`) that CSS depends on.

**Solution:** 
- Add classes manually to React components
- Or create CSS that doesn't depend on plugin state classes

#### 5. Z-Index Stacking Issues

**Problem:** Content renders but is invisible because it's behind another element.

**Diagnosis:** Use browser DevTools to inspect element, check if it exists but has low z-index.

**Example:** Testimonials quote text rendered at z-index: 0 behind background overlay at z-index: 1.

---

### Phase 6: Component-Specific Issues (AboutUsPage Case Study)

Based on manual visual analysis, here are the specific issues found:

#### Header (Status: PARTIAL)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Navigation items | 6 items (HOME, PAGES, ELEMENTS, GALLERY, BLOG, SHOP) | 4 items (HOME, ABOUT, SERVICES, CONTACT) | Add missing dropdown menus |
| Cart icon | Present with badge | Missing | Add cart component |
| Search icon | Present | Missing | Add search component |
| Social icons | Plain icons | Icons in boxes | Remove box styling |

#### Page Title / Hero (Status: GOOD)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Background position | Centered on subject | Slightly different crop | Add `object-position` CSS |
| Overlay opacity | ~60% dark | Matching | None needed |
| Title typography | White, serif, centered | Matching | None needed |

#### Video Section (Status: POOR)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Heading style | Italic serif | Regular weight | Add `font-style: italic` |
| Signature image | Visible handwritten script | Barely visible/broken | Check image path, may be wrong src |
| Play button | Circular white button with triangle | MISSING | Add overlay component |
| Gray bar | Not present | Shows below video | Remove extra element or fix CSS |
| Video popup | Opens YouTube lightbox | Not implemented | Add Magnific Popup replacement |

#### Counter Section (Status: POOR)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Icons | Gold line-art illustrations | Blurry beige squares | Fix image paths |
| Numbers | Animated count-up | Static numbers | Add react-countup or animation |
| Layout | 4 columns | Correct | None |

**Icon Path Investigation:**
- Expected: `/hairy/assets/images/icons/1.png`, `7.png`, `8.png`, `9.png`
- Check: Do these files exist in `public/hairy/assets/images/icons/`?
- Check: Is the `<img src=` attribute using correct path?

#### Team Section (Status: FAIR)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Section heading | Italic serif | Correct | None |
| Member names | Italic serif | Regular weight | Add `font-style: italic` to `.member-info h5` |
| Misplaced logo | Not present | Scissors icon at top-left | Remove stray element |
| Hover overlay | Dark overlay with social icons | Not verified | Test hover state |

#### Testimonials Section (Status: CRITICAL)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Quote text | Large italic white text | COMPLETELY INVISIBLE | Debug immediately |
| Attribution | "– Steve Martin" | INVISIBLE | Same root cause |
| Carousel dots | 3 white dots | MISSING | Add navigation component |
| Background | Wood texture with razor | Correct | None |

**Critical Investigation Required:**
1. Check if quote text is in DOM (DevTools Elements panel)
2. If present, check z-index and position
3. Check if container has height: 0 or overflow: hidden
4. Check if text color is same as background
5. Verify props are being passed to component

#### Blog Section (Status: FAIR)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Section heading | Italic serif | Regular weight | Add italic style |
| Blog titles | Bold | Regular weight | Add `font-weight: bold` to `.entry--title h4` |
| Misplaced logo | Not present | Scissors at top-left | Remove stray element |
| Read More links | Correct | Correct | None |
| VIEW MORE button | Correct | Correct | None |

#### Footer (Status: GOOD)

| Issue | Original | React | Fix |
|-------|----------|-------|-----|
| Layout | 3-column | Matching | None |
| Article thumbnails | Clear images | Some may be broken | Verify image paths |
| Newsletter form | Correct | Correct | None |
| Social icons | Correct | Correct | None |

---

## Tooling Deep Dive

### Script 1: compare-about-us.ts

**Location:** `ui/scripts/compare-about-us.ts`

**Purpose:** Full-page visual comparison with automated report generation.

**Usage:**
```bash
# Ensure both servers are running:
# Terminal 1: cd assets/Hairy && python3 -m http.server 8080
# Terminal 2: cd ui && npm run storybook

cd ui && npx tsx scripts/compare-about-us.ts
```

**Configuration (in script):**
```typescript
const ORIGINAL_URL = 'http://localhost:8080/page-about-us.html'
const REACT_URL = 'http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story'
const VIEWPORT = { width: 1280, height: 720 }
```

**Outputs:**
- Screenshots in `sources/about-us-comparison/`
- Markdown report with findings
- JSON results for programmatic analysis

**Customization Points:**
- Add more sections to `SECTIONS` array
- Change viewport sizes for responsive testing
- Add custom style properties to compare

---

### Script 2: compare-css.ts

**Location:** `ui/scripts/compare-css.ts`

**Purpose:** Deep-dive CSS property comparison for specific selectors.

**Usage:**
```bash
cd ui && npx tsx scripts/compare-css.ts
```

**Key Properties Compared:**
```typescript
const PROPERTIES = [
  'position', 'margin-top', 'margin-bottom', 
  'padding-top', 'padding-bottom',
  'height', 'width', 'display', 'z-index',
  'background-color', 'color'
]
```

**Output Format:**
```
=== #page-title ===
Original: position=relative, margin-top=-140px, height=466px
React:    position=static,   margin-top=0px,    height=1336px
DIFF: position, margin-top, height
```

**When to Use:**
- When visual comparison shows a section is "wrong" but not obvious why
- To verify a CSS fix actually changed the computed values
- To debug z-index and positioning issues

---

### Script 3: capture-sections.ts

**Location:** `ui/scripts/capture-sections.ts`

**Purpose:** Capture individual section screenshots for side-by-side manual review.

**Usage:**
```bash
cd ui && npx tsx scripts/capture-sections.ts
```

**Output:**
- `sources/visual-analysis/original-{section}.png`
- `sources/visual-analysis/react-{section}.png`
- Full page screenshots for both versions

**Section Configuration:**
```typescript
const SECTIONS = [
  { name: 'header', selector: 'header, .header' },
  { name: 'page-title', selector: '#page-title, .page-title' },
  { name: 'video-section', selector: '#video2, .video-button' },
  // ... add more as needed
]
```

**Best Practices:**
- Use multiple fallback selectors (comma-separated)
- Run after Storybook has fully loaded (wait for fonts, images)
- Compare systematically section by section

---

## CSS Override Strategy

### File Structure

```
ui/src/styles/
├── theme.css          # React-specific overrides
└── (other styles)

ui/.storybook/
├── preview-head.html  # CSS injection for Storybook
└── preview.ts         # Storybook configuration
```

### theme.css Purpose

This file contains CSS rules that:
1. Fix React DOM structure mismatches
2. Style React-specific elements (Embla carousel)
3. Override template CSS that assumes jQuery plugin classes

**Example Overrides:**
```css
/* Fix hero section overlap (adjacent sibling selector broken) */
.page-with-hero #page-title {
    margin-top: -140px;
    position: relative;
}

/* Fix background images in React components */
.bg-section img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
}

/* Embla carousel (replacing Owl Carousel) */
.embla {
    overflow: hidden;
}
.embla__container {
    display: flex;
}
.embla__slide {
    flex: 0 0 100%;
    min-width: 0;
}
```

### Storybook CSS Loading

**Critical:** Storybook doesn't automatically load app CSS. Must explicitly include:

```html
<!-- ui/.storybook/preview-head.html -->
<!-- Order matters! Load in this sequence: -->

<!-- 1. Vendor CSS -->
<link rel="stylesheet" href="/hairy/assets/css/vendor/bootstrap.min.css" />
<link rel="stylesheet" href="/hairy/assets/css/vendor/all.min.css" />

<!-- 2. Template CSS -->
<link rel="stylesheet" href="/hairy/assets/css/main.css" />

<!-- 3. React overrides (MUST be last to override) -->
<link rel="stylesheet" href="/src/styles/theme.css" />
```

**Debugging Tip:** If component looks completely wrong in Storybook but fine in app, check that all CSS is loaded in preview-head.html.

---

## Lessons Learned

### What Worked Well

1. **Storybook isolation** - Debugging one section at a time is much faster than debugging a full page
2. **Playwright automation** - Consistent screenshots at same viewport, repeatable
3. **compare-css.ts** - Fastest path to understanding "why does this look wrong?"
4. **Docmgr diaries** - Preserved debugging context for future reference
5. **Props-based data** - Made components testable and reusable

### What Caused Pain

1. **CSS architecture mismatch** - The single biggest time sink. Template CSS makes assumptions about DOM structure that React violates.

2. **Silent asset failures** - Images break without errors. Icons appear as squares. No console warnings.

3. **Storybook CSS gaps** - Lost hours to missing CSS in Storybook before realizing preview-head.html needed updating.

4. **Plugin behavioral translation** - Owl Carousel -> Embla required not just library swap but custom navigation, autoplay, and dot components.

5. **Typography inheritance** - Font styles (italic, bold) don't cascade as expected when component boundaries change.

6. **Z-index wars** - Multiple elements fighting for layer position, causing content to disappear.

### Recommendations for Future Ports

1. **Start with CSS audit** - Before coding, identify all adjacent sibling selectors, parent-child assumptions, and plugin-dependent styles.

2. **Set up Storybook CSS first** - Create preview-head.html with all required CSS before building components.

3. **Build one section end-to-end** - Complete implementation including all fixes before moving to next section.

4. **Run visual comparison after each section** - Don't wait until the whole page is done to find issues.

5. **Document all fixes in theme.css** - Comment what each override fixes and why.

6. **Create asset checklist** - List all images, icons, and fonts that should load. Verify each one.

---

## Implementation Plan

### Phase 1: Immediate Fixes (1-2 days)

1. **Debug TestimonialsSection**
   - Check if quote text exists in DOM
   - Check z-index and positioning
   - Check container dimensions
   - Fix rendering issue

2. **Fix Counter icons**
   - Verify icon files exist in public/hairy/assets/images/icons/
   - Check img src attributes in CounterSection
   - Test direct URL access to icon files

3. **Add Video play button**
   - Create overlay component with play icon
   - Position absolute over video thumbnail
   - (Optional) Add lightbox video player

### Phase 2: Typography and Polish (1-2 days)

4. **Fix italic styling**
   - Video section heading
   - Team member names
   - Blog section heading

5. **Fix bold styling**
   - Blog entry titles

6. **Remove misplaced elements**
   - Stray scissor logos in Team and Blog sections

7. **Fix signature image**
   - Verify path and file exists
   - Check img src attribute

### Phase 3: Tooling Improvements (1-2 days)

8. **Generalize comparison scripts**
   - Make page URL configurable via CLI args
   - Make section list configurable
   - Add JSON output for all scripts

9. **Add asset verification script**
   - Given a list of image paths, verify each loads
   - Report broken images before visual comparison

10. **Create pre-port checklist template**
    - CSS audit checklist
    - Plugin replacement list
    - Asset inventory

### Phase 4: Documentation (ongoing)

11. **Write formal Template Porting Playbook**
    - Step-by-step guide with commands
    - CSS failure mode checklist
    - Troubleshooting flowchart

12. **Maintain plugin replacement registry**
    - jQuery plugin -> React library mapping
    - Configuration notes for each

---

## Open Questions

1. **CSS Architecture Long-term:** Should we commit to Tailwind after parity is achieved? The current global CSS approach is fragile.

2. **Output Location:** Per-ticket `ttmp/.../sources` vs shared `ui/scripts/output`? Per-ticket is cleaner for history but scattered.

3. **CI Integration:** Visual regression testing in CI? Would catch regressions but requires baseline management.

4. **Component Library:** Build a shared component library for reuse across pages? Or keep page-specific for now?

5. **Data Source:** Hardcoded data vs CMS/API? Current approach uses TypeScript data files, but real app may need backend.

---

## References

### Project Documentation
- `ttmp/2026/01/18/2026-01-18-assets-analysis--assets-template-analysis/design-doc/01-assets-template-analysis.md`
- `ttmp/2026/01/18/2026-01-18-assets-analysis--assets-template-analysis/design-doc/02-react-rtk-toolkit-port-plan-about-us-first.md`
- `ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/design-doc/02-css-architecture-analysis-and-recommendations.md`
- `ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/playbook/01-storybook-visual-comparison-testing-playbook.md`
- `ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/reference/01-diary.md`
- `ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/reference/03-visual-analysis-report-component-by-component.md`

### Scripts
- `ui/scripts/compare-about-us.ts` - Full-page comparison
- `ui/scripts/compare-css.ts` - Computed style diffing
- `ui/scripts/capture-sections.ts` - Section screenshot capture

### External Resources
- [Embla Carousel React](https://www.embla-carousel.com/get-started/react/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Storybook Configuration](https://storybook.js.org/docs/configure)

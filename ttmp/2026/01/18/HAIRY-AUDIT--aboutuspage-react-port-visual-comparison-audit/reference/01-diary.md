---
Title: Diary
Ticket: HAIRY-AUDIT
Status: active
Topics:
    - frontend
    - react
    - storybook
DocType: reference
Intent: long-term
Owners: []
RelatedFiles:
    - ui/src/pages/AboutUsPage.tsx:Main React component being audited
    - ui/src/pages/AboutUsPage.stories.tsx:Storybook story for full page render
    - ui/scripts/compare-about-us.ts:Playwright comparison script
    - ui/scripts/compare-css.ts:CSS computed styles comparison script
    - ui/.storybook/preview-head.html:Custom CSS overrides for React structure
    - assets/Hairy/page-about-us.html:Original HTML template being compared
ExternalSources: []
Summary: "Implementation diary for AboutUsPage React port visual comparison audit"
LastUpdated: 2026-01-18T19:30:00.000000000-05:00
WhatFor: "Track the visual comparison audit process"
WhenToUse: "Reference during port debugging"
---

# Diary

## Goal

Document the step-by-step investigation of visual discrepancies between the original Hairy HTML template `page-about-us.html` and the React port rendered in Storybook.

---

## Step 1: Initial Exploration and Ticket Setup

Set up the audit infrastructure and identified the scope of the comparison.

### What I did
- Created ticket HAIRY-AUDIT with docmgr
- Created diary document for tracking progress
- Explored the React component structure in `ui/src/`
- Read the original HTML template at `assets/Hairy/page-about-us.html`
- Examined React components: `AboutUsPage.tsx`, `PageTitleSection.tsx`, `VideoSection.tsx`, `CounterSection.tsx`, `TestimonialsSection.tsx`

### Why
- Need to establish baseline understanding of both versions before comparison

### What I learned
- The original HTML has **7 major sections**: Header, Page Title Hero, Video Section, Counter Section, Team Section, Testimonials, Blog Section, Footer
- The React `AboutUsPage` only renders **4 sections**: PageTitleSection, VideoSection, CounterSection, TestimonialsSection
- The React version is missing: Team Section (#team1) and Blog Section (#blog)
- The Header and Footer are rendered in the Story wrapper, not the page component

### Technical details
Original HTML sections (lines 322-723):
- `#page-title` - Hero banner with "About Us" title
- `#video2` - Video section with description
- `#counter1` - Stats counters
- `#team1` - **Skilled Barbers team members** (MISSING in React)
- `#testimonial2` - Testimonials carousel
- `#blog` - **Blog posts grid** (MISSING in React)
- `#footer` - Footer widgets

---

## Step 2: Playwright Comparison Script Development

Created automated visual comparison tooling using Playwright.

### What I did
- Created `ui/scripts/compare-about-us.ts` Playwright script
- Added ESM module support with `import.meta.url`
- Started local server for original HTML: `python3 -m http.server 8080`
- Installed Playwright Chromium browser: `npx playwright install chromium`
- Ran comparison capturing 18 sections

### Why
- Need automated, reproducible comparison that captures screenshots and computes style/dimension differences

### What worked
- Script successfully loads both pages (original on port 8080, Storybook iframe on port 6006)
- Full page screenshots captured
- Section-by-section comparison with dimension and style extraction
- JSON output for programmatic analysis

### What didn't work
- Initial attempt with `__dirname` failed in ESM module - fixed with `fileURLToPath(import.meta.url)`
- Playwright browsers weren't installed - ran `npx playwright install chromium`

### Technical details
Storybook story URL pattern:
```
http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story
```

Script captures for each section:
- Existence check
- Visibility check
- Bounding box (width, height, x, y)
- Computed styles (fontFamily, fontSize, color, backgroundColor, padding)
- Element screenshot

---

## Step 3: Visual Comparison Results Analysis

Analyzed the automated comparison results revealing critical issues.

### What I did
- Ran comparison script: `npx tsx ./scripts/compare-about-us.ts`
- Captured full page screenshots of both versions
- Analyzed section-by-section comparison results

### What worked
- Script ran successfully, identified 10 issues across 6 sections
- Generated comprehensive JSON and Markdown reports

### What I learned

**CRITICAL FINDINGS:**

1. **4 Missing Sections** - The React port completely omits:
   - `#team1` (Skilled Barbers) - 875px height section with 3 team member cards
   - `.member` team member cards
   - `#blog` (Our Blog Posts) - 994px height section with 3 blog entries
   - `.blog-entry` blog entry cards

2. **Page Title Hero Height Mismatch** - 870px difference:
   - Original: 466px height
   - React: 1336px height
   - **Root cause**: The background image is being rendered at full size instead of being cropped/constrained.

3. **Testimonials Section Height Mismatch** - 936px difference:
   - Original: 465.5px height (carousel shows 1 item at a time)
   - React: 1401px height (all items showing vertically)
   - **Root cause**: The original uses Owl Carousel. React version just lists all testimonials.

4. **Header Navigation Differences**:
   - Original: Full mega-menu with dropdowns
   - React: Simplified navigation

---

## Step 4: Root Cause Analysis

Examined why sections are missing and layout differs.

### What I did
- Examined the React AboutUsPage component structure
- Compared with original HTML section order and content
- Analyzed CSS loading in Storybook vs original

### Root Causes Identified

**1. Missing Content in React Port**
The `AboutUsPage.tsx` only includes PageTitleSection, VideoSection, CounterSection, TestimonialsSection.
Missing: `TeamSection` and `BlogGridSection`

**2. Page Title Hero Layout Issue**
The original uses CSS adjacent sibling selector:
```css
.header-transparent + .page-title {
  position: relative;
  margin-top: -140px;
}
```
But React's component structure wraps content in `<main>`, breaking the adjacent sibling relationship.

**3. Testimonials Carousel Not Implemented**
Original uses Owl Carousel with `data-*` attributes. React just renders all items.

---

## Step 5: Testing AI-Assisted Visual Analysis (pinocchio)

Discovered and tested `pinocchio code professional` for offloading visual comparison questions to another AI model.

### What I did
- Tested the `pinocchio` CLI with multiple screenshots
- Asked broad comparison questions
- Asked specific section-focused questions

### What worked
- Successfully identified missing "Skilled Barbers" and "Blog Posts" sections
- Good at broad categorization

### What didn't work / Limitations
- Some hallucinated details (said breadcrumb was missing when present)
- Generic observations when questions too broad

### When to use pinocchio
| Good For | Not Good For |
|----------|--------------|
| Identifying missing sections | Pixel-perfect accuracy |
| Broad layout differences | Verifying specific CSS values |
| Quick sanity checks | Definitive proof |

---

## Step 6: Implementing the Fix Plan

After creating the fix plan document, we implemented all 5 phases.

### Phase 1: CSS Fixes
- Added `.page-with-hero` class to `AboutUsPage` main element
- Added CSS rule in `theme.css`

### Phase 2: Testimonials Carousel
- Installed `embla-carousel-react` package
- Refactored `TestimonialsSection` to use Embla hooks
- Added carousel dots navigation

### Phase 3: TeamSection Component
- Created `TeamSection.tsx` with `TeamMember` interface
- Implements hover overlay for social links
- Created Storybook stories

### Phase 4: BlogGridSection Component
- Created `BlogGridSection.tsx` with `BlogEntry` interface
- Includes entry image, meta, title, excerpt
- Created Storybook stories

### Phase 5: Integration
- Updated `AboutUsPage.tsx` to import all sections
- Added data to `aboutUs.ts`
- Fixed smart quote syntax error

### Result
All sections now render, but hero section layout still broken.

---

## Step 7: CSS Debugging with Computed Styles Comparison

After components were added, hero section still looked wrong. Created dedicated CSS comparison tool.

### What I did
- Created `ui/scripts/compare-css.ts` - extracts computed styles from both pages
- Ran detailed CSS comparison on specific selectors
- Captured side-by-side section screenshots

### What I found

**CSS Comparison Report showed:**

```
Page Title Section (#page-title):
  DIMENSIONS:
     Original: 1280x466 @ (0, 0)
     React:    1280x1336 @ (0, 140)

  KEY STYLES:
     ✗ position: Original=relative, React=static
     ✗ marginTop: Original=-140px, React=0px
     ✗ height: Original=466px, React=1336px
     ✗ zIndex: Original=1, React=auto
```

### Root Cause Identified

The CSS rule `.page-with-hero #page-title` was in `theme.css`, but **Storybook wasn't loading theme.css**! 

Storybook's `preview-head.html` only loaded:
```html
<link rel="stylesheet" href="/hairy/assets/css/external.css" />
<link rel="stylesheet" href="/hairy/assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="/hairy/assets/css/style.css" />
```

It was NOT loading our custom `theme.css` with the React-specific overrides.

### The Fix

Added inline `<style>` block directly to `preview-head.html` with all React-specific CSS overrides:

```html
<style>
/* Fix for page-title hero overlap with fixed header */
.page-with-hero #page-title,
.page-with-hero .page-title {
  margin-top: -140px;
  position: relative;
  z-index: 1;
}

/* Fix for bg-section using <img> instead of background-image */
.page-title .bg-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

.page-title .bg-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Embla Carousel styles */
.embla__container { display: flex; }
.embla__slide { flex: 0 0 100%; min-width: 0; }
/* ... carousel dots ... */
</style>
```

### Result After Fix

```
Page Title Section (#page-title):
  DIMENSIONS:
     Original: 1280x466 @ (0, 0)
     React:    1280x466 @ (0, 0)   ✅ MATCH!
```

All critical dimensions now match.

### Key Learnings

1. **CSS loading order matters** - Storybook's preview-head.html determines what CSS is available
2. **The compare-css.ts script is invaluable** - Quickly pinpoints exact property differences
3. **Adjacent sibling selectors break with React** - Must use direct class-based selectors instead
4. **`<img>` in bg-section needs explicit styling** - Original CSS expects background-image property

---

## Step 8: Final Verification

### What I did
- Ran compare-css.ts to verify dimensions match
- Used pinocchio to compare full pages
- Captured final screenshots

### Final Comparison Results

| Section | Original Size | React Size | Match |
|---------|--------------|------------|-------|
| Page Title | 1280x466 | 1280x466 | ✅ |
| Title Heading | 1140x72 @ (70, 220) | 1140x72 @ (70, 220) | ✅ |
| Breadcrumb | 1140x14 @ (70, 312) | 1140x14 @ (70, 312) | ✅ |
| Header | 1280x140 | 1280x140 | ✅ |
| Navbar | 1280x90 @ (0, 50) | 1280x90 @ (0, 50) | ✅ |

### Remaining Minor Differences
- Navigation menu items differ (original has more items)
- Background image crop slightly different (object-fit positioning)
- These are acceptable for MVP

---

## Summary of Tools and Scripts Created

| Tool | Purpose | Location |
|------|---------|----------|
| `compare-about-us.ts` | Full visual comparison, captures 18 sections | `ui/scripts/` |
| `compare-css.ts` | CSS computed styles extraction and diff | `ui/scripts/` |
| `preview-head.html` | Storybook CSS overrides for React structure | `ui/.storybook/` |

## Key Takeaways

1. **Always verify CSS is actually loaded** - Check browser devtools or use compare-css.ts
2. **Adjacent sibling selectors don't work with React wrappers** - Use explicit selectors
3. **`<img>` needs different CSS than background-image** - absolute positioning + object-fit
4. **Storybook preview-head.html is where CSS overrides go** - Not just theme.css
5. **pinocchio is great for broad comparisons** - But verify with Playwright for accuracy
6. **compare-css.ts is the debugging workhorse** - Shows exact property differences


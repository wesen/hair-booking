/**
 * Visual Comparison Script: AboutUsPage
 * 
 * Compares the original Hairy HTML template with the React port in Storybook.
 * 
 * Prerequisites:
 * - Storybook running on port 6006
 * - A static server serving original HTML on port 8080
 * 
 * Usage:
 *   cd ui && npx tsx ../scripts/compare-about-us.ts
 */

import { chromium, type Browser, type Page, type Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const STORYBOOK_URL = 'http://localhost:6006';
const ORIGINAL_URL = 'http://localhost:8080/page-about-us.html';
const SCREENSHOTS_DIR = path.join(__dirname, '../ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/sources');

interface ComparisonResult {
  section: string;
  original: {
    exists: boolean;
    visible: boolean;
    computedStyles?: Record<string, string>;
    bounds?: { width: number; height: number; x: number; y: number };
    screenshot?: string;
  };
  react: {
    exists: boolean;
    visible: boolean;
    computedStyles?: Record<string, string>;
    bounds?: { width: number; height: number; x: number; y: number };
    screenshot?: string;
  };
  issues: string[];
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureElement(page: Page, selector: string, name: string, prefix: string): Promise<{
  exists: boolean;
  visible: boolean;
  computedStyles?: Record<string, string>;
  bounds?: { width: number; height: number; x: number; y: number };
  screenshot?: string;
}> {
  const element = page.locator(selector).first();
  const exists = await element.count() > 0;
  
  if (!exists) {
    return { exists: false, visible: false };
  }
  
  const visible = await element.isVisible().catch(() => false);
  
  if (!visible) {
    return { exists: true, visible: false };
  }
  
  // Get bounding box
  const box = await element.boundingBox();
  const bounds = box ? { width: box.width, height: box.height, x: box.x, y: box.y } : undefined;
  
  // Get computed styles
  const styles = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      padding: computed.padding,
      margin: computed.margin,
      display: computed.display,
      position: computed.position,
    };
  }).catch(() => undefined);
  
  // Take screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${prefix}-${name}.png`);
  await element.screenshot({ path: screenshotPath }).catch(() => {});
  
  return {
    exists: true,
    visible: true,
    computedStyles: styles,
    bounds,
    screenshot: screenshotPath,
  };
}

async function captureFullPage(page: Page, name: string): Promise<string> {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

async function compareSection(
  originalPage: Page,
  reactPage: Page,
  selector: string,
  sectionName: string
): Promise<ComparisonResult> {
  const issues: string[] = [];
  
  const original = await captureElement(originalPage, selector, sectionName, 'original');
  const react = await captureElement(reactPage, selector, sectionName, 'react');
  
  // Compare existence
  if (original.exists && !react.exists) {
    issues.push(`MISSING: Section "${sectionName}" exists in original but NOT in React port`);
  } else if (!original.exists && react.exists) {
    issues.push(`EXTRA: Section "${sectionName}" exists in React port but NOT in original`);
  }
  
  // Compare visibility
  if (original.visible && !react.visible) {
    issues.push(`INVISIBLE: Section "${sectionName}" is visible in original but hidden in React port`);
  }
  
  // Compare bounds (dimensions)
  if (original.bounds && react.bounds) {
    const widthDiff = Math.abs(original.bounds.width - react.bounds.width);
    const heightDiff = Math.abs(original.bounds.height - react.bounds.height);
    
    if (widthDiff > 10) {
      issues.push(`WIDTH MISMATCH: "${sectionName}" - Original: ${original.bounds.width}px, React: ${react.bounds.width}px (diff: ${widthDiff}px)`);
    }
    if (heightDiff > 10) {
      issues.push(`HEIGHT MISMATCH: "${sectionName}" - Original: ${original.bounds.height}px, React: ${react.bounds.height}px (diff: ${heightDiff}px)`);
    }
  }
  
  // Compare key styles
  if (original.computedStyles && react.computedStyles) {
    const stylesToCompare = ['fontFamily', 'fontSize', 'color', 'backgroundColor', 'padding'];
    for (const styleProp of stylesToCompare) {
      const origVal = original.computedStyles[styleProp];
      const reactVal = react.computedStyles[styleProp];
      if (origVal !== reactVal) {
        issues.push(`STYLE MISMATCH "${sectionName}" ${styleProp}: Original="${origVal}" React="${reactVal}"`);
      }
    }
  }
  
  return { section: sectionName, original, react, issues };
}

async function main() {
  console.log('🔍 Starting AboutUsPage Visual Comparison Audit\n');
  
  await ensureDir(SCREENSHOTS_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  
  // Open both pages
  const originalPage = await context.newPage();
  const reactPage = await context.newPage();
  
  console.log('📄 Loading original HTML template...');
  try {
    await originalPage.goto(ORIGINAL_URL, { waitUntil: 'networkidle', timeout: 10000 });
    // Wait for any animations/preloaders
    await originalPage.waitForTimeout(2000);
    // Try to dismiss preloader if present
    await originalPage.evaluate(() => {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        (preloader as HTMLElement).style.display = 'none';
      }
    });
    console.log('  ✓ Original page loaded');
  } catch (e) {
    console.error('  ✗ Failed to load original page:', e);
    console.log('\n⚠️  Please start a local server for the original HTML:');
    console.log('   cd assets/Hairy && python3 -m http.server 8080');
    await browser.close();
    process.exit(1);
  }
  
  console.log('📄 Loading React Storybook version...');
  try {
    // Navigate to the AboutUsPage full story
    const storyUrl = `${STORYBOOK_URL}/iframe.html?id=pages-aboutuspage--full-page&viewMode=story`;
    await reactPage.goto(storyUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await reactPage.waitForTimeout(1000);
    console.log('  ✓ React Storybook page loaded');
  } catch (e) {
    console.error('  ✗ Failed to load Storybook page:', e);
    console.log('\n⚠️  Please ensure Storybook is running:');
    console.log('   cd ui && npm run storybook');
    await browser.close();
    process.exit(1);
  }
  
  // Take full page screenshots
  console.log('\n📸 Capturing full page screenshots...');
  const originalFullScreenshot = await captureFullPage(originalPage, 'full-page-original');
  const reactFullScreenshot = await captureFullPage(reactPage, 'full-page-react');
  console.log(`  ✓ Original: ${originalFullScreenshot}`);
  console.log(`  ✓ React: ${reactFullScreenshot}`);
  
  // Define sections to compare
  const sections = [
    { selector: '#page-title', name: 'page-title-hero' },
    { selector: '.page-title h1', name: 'page-title-heading' },
    { selector: '.breadcrumb', name: 'breadcrumb' },
    { selector: '#video2', name: 'video-section' },
    { selector: '.heading--title', name: 'video-heading' },
    { selector: '.video--content', name: 'video-player-area' },
    { selector: '#counter1', name: 'counter-section' },
    { selector: '.count-box', name: 'count-box-first' },
    { selector: '#testimonial2', name: 'testimonials-section' },
    { selector: '.testimonial-panel', name: 'testimonial-card' },
    { selector: '#team1', name: 'team-section' },
    { selector: '.member', name: 'team-member-card' },
    { selector: '#blog', name: 'blog-section' },
    { selector: '.blog-entry', name: 'blog-entry-card' },
    { selector: '#footer', name: 'footer' },
    { selector: '.footer-widget', name: 'footer-widgets' },
    { selector: 'header', name: 'header' },
    { selector: '.navbar', name: 'navbar' },
  ];
  
  console.log('\n🔬 Comparing sections...\n');
  const results: ComparisonResult[] = [];
  
  for (const { selector, name } of sections) {
    const result = await compareSection(originalPage, reactPage, selector, name);
    results.push(result);
    
    const status = result.issues.length === 0 ? '✓' : '✗';
    console.log(`  ${status} ${name}`);
    for (const issue of result.issues) {
      console.log(`      └─ ${issue}`);
    }
  }
  
  // Generate report
  console.log('\n📝 Generating report...\n');
  
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const sectionsWithIssues = results.filter(r => r.issues.length > 0);
  const missingSections = results.filter(r => !r.react.exists && r.original.exists);
  
  const report = `# AboutUsPage Visual Comparison Audit Report

## Summary

- **Date**: ${new Date().toISOString()}
- **Total Sections Compared**: ${results.length}
- **Sections with Issues**: ${sectionsWithIssues.length}
- **Total Issues Found**: ${totalIssues}
- **Missing Sections in React**: ${missingSections.length}

## Full Page Screenshots

| Version | Screenshot |
|---------|------------|
| Original HTML | ![Original](sources/full-page-original.png) |
| React Port | ![React](sources/full-page-react.png) |

## Detailed Findings

${results.map(r => `
### ${r.section}

**Status**: ${r.issues.length === 0 ? '✅ PASS' : '❌ ISSUES FOUND'}

| Aspect | Original | React |
|--------|----------|-------|
| Exists | ${r.original.exists ? '✓' : '✗'} | ${r.react.exists ? '✓' : '✗'} |
| Visible | ${r.original.visible ? '✓' : '✗'} | ${r.react.visible ? '✓' : '✗'} |
| Width | ${r.original.bounds?.width ?? 'N/A'}px | ${r.react.bounds?.width ?? 'N/A'}px |
| Height | ${r.original.bounds?.height ?? 'N/A'}px | ${r.react.bounds?.height ?? 'N/A'}px |

${r.issues.length > 0 ? `
**Issues:**
${r.issues.map(i => `- ${i}`).join('\n')}
` : ''}

${r.original.screenshot && r.react.screenshot ? `
**Screenshots:**
| Original | React |
|----------|-------|
| ![Original ${r.section}](sources/original-${r.section}.png) | ![React ${r.section}](sources/react-${r.section}.png) |
` : ''}
`).join('\n')}

## Missing Sections Analysis

The following sections exist in the original HTML but are completely missing from the React port:

${missingSections.length > 0 ? missingSections.map(r => `- **${r.section}**`).join('\n') : 'None - all sections are present'}

## Style Differences Summary

${sectionsWithIssues.filter(r => r.issues.some(i => i.includes('STYLE'))).map(r => `
### ${r.section}
${r.issues.filter(i => i.includes('STYLE')).map(i => `- ${i}`).join('\n')}
`).join('\n') || 'No major style differences detected.'}

## Dimension Differences Summary

${sectionsWithIssues.filter(r => r.issues.some(i => i.includes('MISMATCH'))).map(r => `
### ${r.section}
${r.issues.filter(i => i.includes('MISMATCH')).map(i => `- ${i}`).join('\n')}
`).join('\n') || 'No major dimension differences detected.'}

---

*Report generated by compare-about-us.ts*
`;

  const reportPath = path.join(SCREENSHOTS_DIR, '../reference/02-visual-audit-report.md');
  await ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved to: ${reportPath}`);
  
  // Also output JSON for programmatic use
  const jsonPath = path.join(SCREENSHOTS_DIR, 'comparison-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 JSON results saved to: ${jsonPath}`);
  
  await browser.close();
  
  console.log('\n✅ Comparison complete!');
  console.log(`   ${totalIssues} issue(s) found across ${sectionsWithIssues.length} section(s)`);
}

main().catch(console.error);

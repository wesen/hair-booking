/**
 * CSS Comparison Script: Compare computed styles between original HTML and React
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ORIGINAL_URL = 'http://localhost:8080/page-about-us.html'
const REACT_URL = 'http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story'

interface StyleComparison {
  selector: string
  property: string
  original: string
  react: string
  match: boolean
}

async function getComputedStyles(page: any, selector: string, properties: string[]) {
  return await page.evaluate(
    ({ sel, props }: { sel: string; props: string[] }) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const styles = window.getComputedStyle(el)
      const result: Record<string, string> = {}
      for (const prop of props) {
        result[prop] = styles.getPropertyValue(prop)
      }
      return result
    },
    { sel: selector, props: properties }
  )
}

async function getElementInfo(page: any, selector: string) {
  return await page.evaluate((sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const styles = window.getComputedStyle(el)
    return {
      exists: true,
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      bounds: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      computedStyles: {
        // Layout
        display: styles.display,
        position: styles.position,
        top: styles.top,
        left: styles.left,
        right: styles.right,
        bottom: styles.bottom,
        margin: styles.margin,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        padding: styles.padding,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        width: styles.width,
        height: styles.height,
        minHeight: styles.minHeight,
        maxWidth: styles.maxWidth,
        // Background
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        backgroundSize: styles.backgroundSize,
        backgroundPosition: styles.backgroundPosition,
        // Typography
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        color: styles.color,
        textAlign: styles.textAlign,
        // Other
        zIndex: styles.zIndex,
        overflow: styles.overflow,
      },
    }
  }, selector)
}

async function main() {
  const browser = await chromium.launch()

  // Open both pages
  const originalPage = await browser.newPage()
  const reactPage = await browser.newPage()

  console.log('Loading original HTML...')
  await originalPage.goto(ORIGINAL_URL, { waitUntil: 'networkidle' })

  console.log('Loading React Storybook...')
  await reactPage.goto(REACT_URL, { waitUntil: 'networkidle' })
  await reactPage.waitForTimeout(3000) // Wait for React to fully render

  // Selectors to compare
  const selectors = [
    { name: 'Page Title Section', selector: '#page-title, .page-title' },
    { name: 'Page Title Container', selector: '#page-title .container, .page-title .container' },
    { name: 'Title Wrapper', selector: '.page-title .title, #page-title .title' },
    { name: 'Title Heading', selector: '.page-title h1, .title--heading h1' },
    { name: 'Breadcrumb', selector: '.breadcrumb' },
    { name: 'Background Section', selector: '.bg-section' },
    { name: 'Background Image', selector: '.bg-section img' },
    { name: 'Header', selector: 'header, .header' },
    { name: 'Navbar', selector: '.navbar' },
  ]

  console.log('\n' + '='.repeat(80))
  console.log('CSS COMPARISON REPORT: PageTitleSection')
  console.log('='.repeat(80))

  for (const { name, selector } of selectors) {
    console.log(`\n### ${name} (${selector})`)
    console.log('-'.repeat(60))

    const originalInfo = await getElementInfo(originalPage, selector)
    const reactInfo = await getElementInfo(reactPage, selector)

    if (!originalInfo) {
      console.log('  ❌ NOT FOUND in original')
      continue
    }
    if (!reactInfo) {
      console.log('  ❌ NOT FOUND in React')
      continue
    }

    // Compare bounds
    console.log('\n  📐 DIMENSIONS:')
    console.log(`     Original: ${originalInfo.bounds.width.toFixed(0)}x${originalInfo.bounds.height.toFixed(0)} @ (${originalInfo.bounds.left.toFixed(0)}, ${originalInfo.bounds.top.toFixed(0)})`)
    console.log(`     React:    ${reactInfo.bounds.width.toFixed(0)}x${reactInfo.bounds.height.toFixed(0)} @ (${reactInfo.bounds.left.toFixed(0)}, ${reactInfo.bounds.top.toFixed(0)})`)

    // Compare key styles
    console.log('\n  🎨 KEY STYLES:')
    const stylesToCheck = [
      'display',
      'position',
      'marginTop',
      'paddingTop',
      'paddingBottom',
      'height',
      'minHeight',
      'backgroundColor',
      'backgroundImage',
      'backgroundSize',
      'fontSize',
      'fontWeight',
      'color',
      'zIndex',
    ]

    for (const prop of stylesToCheck) {
      const orig = (originalInfo.computedStyles as any)[prop] || 'N/A'
      const react = (reactInfo.computedStyles as any)[prop] || 'N/A'
      const match = orig === react
      const icon = match ? '✓' : '✗'
      if (!match) {
        console.log(`     ${icon} ${prop}:`)
        console.log(`        Original: ${orig}`)
        console.log(`        React:    ${react}`)
      }
    }
  }

  // Take side-by-side screenshots of just the page-title section
  console.log('\n\n📸 Taking section screenshots...')

  const originalPageTitle = await originalPage.$('#page-title, .page-title')
  const reactPageTitle = await reactPage.$('#page-title, .page-title')

  if (originalPageTitle) {
    await originalPageTitle.screenshot({
      path: path.join(__dirname, '../../ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/sources/css-compare-original-pagetitle.png'),
    })
    console.log('  ✓ Saved original page-title screenshot')
  }

  if (reactPageTitle) {
    await reactPageTitle.screenshot({
      path: path.join(__dirname, '../../ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/sources/css-compare-react-pagetitle.png'),
    })
    console.log('  ✓ Saved React page-title screenshot')
  }

  await browser.close()
  console.log('\n✅ Comparison complete!')
}

main().catch(console.error)

/**
 * Capture individual section screenshots from both original and React versions
 */

import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ORIGINAL_URL = 'http://localhost:8080/page-about-us.html'
const REACT_URL = 'http://localhost:6006/iframe.html?id=pages-aboutuspage--full-page&viewMode=story'
const OUTPUT_DIR = path.join(__dirname, '../../ttmp/2026/01/18/HAIRY-AUDIT--aboutuspage-react-port-visual-comparison-audit/sources/visual-analysis')

const SECTIONS = [
  { name: 'header', selector: 'header, .header' },
  { name: 'page-title', selector: '#page-title, .page-title' },
  { name: 'video-section', selector: '#video2, .video-button' },
  { name: 'counter-section', selector: '#counter1, .counter' },
  { name: 'team-section', selector: '#team1, .team' },
  { name: 'testimonials-section', selector: '#testimonial2, .testimonial-2' },
  { name: 'blog-section', selector: '#blog, .blog-grid' },
  { name: 'footer', selector: 'footer, .footer' },
]

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  
  // Capture original
  console.log('📸 Capturing original sections...')
  const originalPage = await browser.newPage()
  await originalPage.setViewportSize({ width: 1280, height: 720 })
  await originalPage.goto(ORIGINAL_URL, { waitUntil: 'networkidle' })
  
  // Full page
  await originalPage.screenshot({ 
    path: path.join(OUTPUT_DIR, 'original-full.png'), 
    fullPage: true 
  })
  console.log('  ✓ original-full.png')

  for (const section of SECTIONS) {
    try {
      const element = await originalPage.$(section.selector)
      if (element) {
        await element.screenshot({ 
          path: path.join(OUTPUT_DIR, `original-${section.name}.png`) 
        })
        console.log(`  ✓ original-${section.name}.png`)
      } else {
        console.log(`  ✗ original-${section.name} - NOT FOUND`)
      }
    } catch (e) {
      console.log(`  ✗ original-${section.name} - ERROR: ${e.message}`)
    }
  }

  // Capture React
  console.log('\n📸 Capturing React sections...')
  const reactPage = await browser.newPage()
  await reactPage.setViewportSize({ width: 1280, height: 720 })
  await reactPage.goto(REACT_URL, { waitUntil: 'networkidle' })
  await reactPage.waitForTimeout(3000)
  
  // Full page
  await reactPage.screenshot({ 
    path: path.join(OUTPUT_DIR, 'react-full.png'), 
    fullPage: true 
  })
  console.log('  ✓ react-full.png')

  for (const section of SECTIONS) {
    try {
      const element = await reactPage.$(section.selector)
      if (element) {
        await element.screenshot({ 
          path: path.join(OUTPUT_DIR, `react-${section.name}.png`) 
        })
        console.log(`  ✓ react-${section.name}.png`)
      } else {
        console.log(`  ✗ react-${section.name} - NOT FOUND`)
      }
    } catch (e) {
      console.log(`  ✗ react-${section.name} - ERROR: ${e.message}`)
    }
  }

  await browser.close()
  console.log(`\n✅ Screenshots saved to ${OUTPUT_DIR}`)
}

main().catch(console.error)

---
Title: AboutUsPage React Port Fix Plan
Ticket: HAIRY-AUDIT
Status: active
Topics:
    - frontend
    - react
    - storybook
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - ui/src/pages/AboutUsPage.tsx:Main page component to fix
    - ui/src/components/sections/PageTitleSection.tsx:Hero section with height issue
    - ui/src/components/sections/TestimonialsSection.tsx:Needs carousel integration
    - assets/Hairy/page-about-us.html:Original HTML reference
    - ui/public/hairy/assets/css/style.css:Original CSS rules
ExternalSources: []
Summary: "Technical plan to fix all visual issues identified in the AboutUsPage audit"
LastUpdated: 2026-01-18
---

# AboutUsPage React Port Fix Plan

## Executive Summary

The AboutUsPage React port has **4 critical missing sections** and **2 major layout issues**. This document provides a detailed implementation plan to achieve visual parity with the original HTML template.

**Estimated effort**: 4-6 hours
**Priority order**: CSS fixes first (quick wins), then missing components

---

## Problem Statement

The visual comparison audit identified:

| Issue | Type | Impact |
|-------|------|--------|
| Missing TeamSection | Missing Component | 875px content gap |
| Missing BlogGridSection | Missing Component | 994px content gap |
| Page Title hero height wrong | CSS Issue | 870px height diff |
| Testimonials not in carousel | JS/Component Issue | 936px height diff |

Total: ~2,800px of visual difference from the original.

---

## Proposed Solution

### Phase 1: CSS Fixes (30 min)

#### 1.1 Fix Page Title Hero Height

**Root Cause Analysis:**

The original CSS uses an adjacent sibling selector:

```css
/* Original CSS - style.css line ~240 */
.header-transparent + .page-title,
.header-transparent + .slider {
  position: relative;
  margin-top: -140px;
}
```

This rule applies when `.page-title` is the **immediate sibling** of `.header-transparent`. In the React port:
- The Header is in the Story wrapper
- The `<main>` element wraps AboutUsPage content
- This breaks the adjacent sibling relationship

**Solution Options:**

| Option | Pros | Cons |
|--------|------|------|
| A. Add margin-top directly to page-title | Quick fix | May break other pages |
| B. Restructure to remove `<main>` wrapper | Maintains CSS selector | Semantic HTML concern |
| C. Add explicit CSS class for pages with hero | Flexible, explicit | Requires class management |

**Recommended: Option C** - Add a `.page-with-hero` class

```tsx
// AboutUsPage.tsx
export function AboutUsPage() {
  return (
    <main className="page-with-hero">
      <PageTitleSection ... />
```

```css
/* Add to theme.css or create page-overrides.css */
.page-with-hero > #page-title {
  margin-top: -140px;
  position: relative;
}
```

**Alternative (Storybook-only fix):**

Modify the Story to not wrap in extra elements:

```tsx
// AboutUsPage.stories.tsx
export const FullPage: Story = {
  render: () => (
    <>
      <Header />
      <AboutUsPage />  {/* page-title now adjacent to header */}
      <Footer />
    </>
  ),
}
```

#### 1.2 Fix Page Title Background Image Sizing

The background image may need explicit height constraint:

```css
/* Ensure bg-section fills container properly */
#page-title {
  min-height: 326px; /* 220px top padding + 140px bottom - 140px margin overlap */
}

#page-title .bg-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

#page-title .bg-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

### Phase 2: Testimonials Carousel (1-2 hours)

#### 2.1 Choose Carousel Library

| Library | Size | Pros | Cons |
|---------|------|------|------|
| **Embla Carousel** | 5kb | Lightweight, accessible, React hooks | Need custom dots |
| Swiper | 40kb | Feature-rich, dots built-in | Heavier |
| react-slick | 25kb | Popular, Owl-like API | jQuery legacy design |

**Recommended: Embla Carousel** - lightweight and modern

#### 2.2 Install Dependencies

```bash
cd ui
npm install embla-carousel-react
```

#### 2.3 Implement Carousel

```tsx
// TestimonialsSection.tsx
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

export function TestimonialsSection({ items, backgroundImageUrl }: TestimonialsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section id="testimonial2" className="testimonial testimonial-2 bg-overlay bg-overlay-dark bg-parallax text-center">
      {backgroundImageUrl && (
        <div className="bg-section">
          <img src={backgroundImageUrl} alt="Background" />
        </div>
      )}
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-8 col-md-offset-2">
            <div className="carousel carousel-dots carousel-white" ref={emblaRef}>
              <div className="embla__container" style={{ display: 'flex' }}>
                {items.map((item, index) => (
                  <div key={index} className="embla__slide" style={{ flex: '0 0 100%' }}>
                    <div className="testimonial-panel">
                      <div className="testimonial--body">
                        <p>"{item.quote}"</p>
                      </div>
                      <div className="testimonial--meta-content">
                        <h4>– {item.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots navigation */}
            <div className="carousel-dots-nav">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === selectedIndex ? 'active' : ''}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### 2.4 Add Carousel CSS

```css
/* Add to theme.css */
.embla__container {
  display: flex;
}

.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}

.carousel-dots-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.carousel-dots-nav .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  padding: 0;
}

.carousel-dots-nav .dot.active {
  background: #ffffff;
}
```

---

### Phase 3: Create TeamSection Component (1-1.5 hours)

#### 3.1 Component Interface

```tsx
// ui/src/components/sections/TeamSection.tsx
export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    googlePlus?: string;
  };
}

export interface TeamSectionProps {
  heading?: string;
  description?: string;
  members: TeamMember[];
}
```

#### 3.2 Component Implementation

```tsx
export function TeamSection({ heading, description, members }: TeamSectionProps) {
  return (
    <section id="team1" className="team team-1">
      <div className="container">
        {(heading || description) && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
              <div className="text--center heading heading-2 mb-70">
                {heading && <h2 className="heading--title">{heading}</h2>}
                {description && <p className="heading--desc mb-0">{description}</p>}
                <div className="divider--line divider--center" />
              </div>
            </div>
          </div>
        )}
        <div className="row">
          {members.map((member, index) => (
            <div key={index} className="col-xs-12 col-sm-4 col-md-4">
              <div className="member">
                <div className="member-img">
                  <img src={member.imageUrl} alt={member.name} />
                  <div className="member-overlay">
                    <div className="member-social">
                      <div className="pos-vertical-center">
                        {member.socialLinks?.facebook && (
                          <a href={member.socialLinks.facebook}>
                            <i className="fa fa-facebook" />
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a href={member.socialLinks.twitter}>
                            <i className="fa fa-twitter" />
                          </a>
                        )}
                        {member.socialLinks?.googlePlus && (
                          <a href={member.socialLinks.googlePlus}>
                            <i className="fa fa-google-plus" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="member-info">
                  <h5>{member.name}</h5>
                  <h6>{member.role}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 3.3 Add Data

```tsx
// ui/src/data/aboutUs.ts
export const aboutUsTeamMembers: TeamMember[] = [
  {
    name: 'Ryan Printz',
    role: 'Barber',
    imageUrl: '/hairy/assets/images/team/grid/1.jpg',
    socialLinks: { facebook: '#', twitter: '#', googlePlus: '#' },
  },
  {
    name: 'Steve Martin',
    role: 'Barber',
    imageUrl: '/hairy/assets/images/team/grid/2.jpg',
    socialLinks: { facebook: '#', twitter: '#', googlePlus: '#' },
  },
  {
    name: 'Bruce Sam',
    role: 'Barber',
    imageUrl: '/hairy/assets/images/team/grid/3.jpg',
    socialLinks: { facebook: '#', twitter: '#', googlePlus: '#' },
  },
]
```

---

### Phase 4: Create BlogGridSection Component (1-1.5 hours)

#### 4.1 Component Interface

```tsx
// ui/src/components/sections/BlogGridSection.tsx
export interface BlogEntry {
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  category: string;
  href?: string;
}

export interface BlogGridSectionProps {
  heading?: string;
  description?: string;
  entries: BlogEntry[];
  showViewMore?: boolean;
}
```

#### 4.2 Component Implementation

```tsx
export function BlogGridSection({ heading, description, entries, showViewMore }: BlogGridSectionProps) {
  return (
    <section id="blog" className="blog blog-grid pb-100">
      <div className="container">
        {(heading || description) && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-md-offset-3">
              <div className="heading text--center mb-70">
                {heading && <h2 className="heading--title">{heading}</h2>}
                {description && <p className="heading--desc">{description}</p>}
                <div className="divider--line" />
              </div>
            </div>
          </div>
        )}
        <div className="row">
          {entries.map((entry, index) => (
            <div key={index} className="col-xs-12 col-sm-12 col-md-4">
              <div className="blog-entry">
                <div className="entry--img">
                  <a href={entry.href || '#'}>
                    <img src={entry.imageUrl} alt={entry.title} />
                  </a>
                  <div className="entry--overlay">
                    <a href={entry.href || '#'}>
                      <i className="fa fa-chain" />
                    </a>
                  </div>
                </div>
                <div className="entry--content">
                  <div className="entry--meta">
                    <span>{entry.date}</span>
                    <span><a href="#">{entry.category}</a></span>
                  </div>
                  <div className="entry--title">
                    <h4><a href={entry.href || '#'}>{entry.title}</a></h4>
                  </div>
                  <div className="entry--bio">{entry.excerpt}</div>
                  <div className="entry--more">
                    <a href={entry.href || '#'}>
                      read more <i className="fa fa-angle-double-right" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {showViewMore && (
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-12 clearfix mt-20 text--center">
              <a href="#" className="btn btn--secondary btn--bordered btn--rounded">
                View More
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

#### 4.3 Add Data

```tsx
// ui/src/data/aboutUs.ts
export const aboutUsBlogEntries: BlogEntry[] = [
  {
    title: 'Foil shaver versus clippers & trimmers',
    excerpt: 'Are you a dedicated razor shaver? dude who hasn\'t really thought about trying a different..',
    imageUrl: '/hairy/assets/images/blog/grid/1.jpg',
    date: 'Oct 20, 2017',
    category: 'barbers',
  },
  {
    title: 'Men\'s hairstyles for all face shapes',
    excerpt: 'Most of the time, men don\'t know the haircuts that suit their face shape - but don\'t worry, we\'re here to..',
    imageUrl: '/hairy/assets/images/blog/grid/2.jpg',
    date: 'Oct 15, 2017',
    category: 'Styles',
  },
  {
    title: 'Basic tips for styling men\'s hair',
    excerpt: 'The first tip is to choose a hairstyle that\'s realistic for your lifestyle, hair type, and general image..',
    imageUrl: '/hairy/assets/images/blog/grid/3.jpg',
    date: 'Oct 25, 2017',
    category: 'Haircut',
  },
]
```

---

### Phase 5: Update AboutUsPage (15 min)

```tsx
// ui/src/pages/AboutUsPage.tsx
import { CounterSection } from '../components/sections/CounterSection'
import { PageTitleSection } from '../components/sections/PageTitleSection'
import { TeamSection } from '../components/sections/TeamSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { BlogGridSection } from '../components/sections/BlogGridSection'
import {
  aboutUsBreadcrumbs,
  aboutUsCounters,
  aboutUsTestimonials,
  aboutUsVideo,
  aboutUsTeamMembers,
  aboutUsBlogEntries,
} from '../data/aboutUs'

export function AboutUsPage() {
  return (
    <main className="page-with-hero">
      <PageTitleSection
        title="About Us"
        backgroundImageUrl="/hairy/assets/images/page-titles/7.jpg"
        breadcrumbs={aboutUsBreadcrumbs}
      />
      <VideoSection {...aboutUsVideo} />
      <CounterSection items={aboutUsCounters} />
      <TeamSection
        heading="Skilled Barbers"
        description="Duis aute irure dolor in reprehenderit volupte velit esse cillum dolore eu fugiat pariatursint occaecat cupidatat non proident culpa."
        members={aboutUsTeamMembers}
      />
      <TestimonialsSection
        backgroundImageUrl="/hairy/assets/images/background/3.jpg"
        items={aboutUsTestimonials}
      />
      <BlogGridSection
        heading="Our Blog Posts"
        description="Duis aute irure dolor in reprehenderit volupte velit esse cillum dolore eu fugiat pariatursint occaecat cupidatat non proident culpa."
        entries={aboutUsBlogEntries}
        showViewMore
      />
    </main>
  )
}
```

---

## Implementation Checklist

### Phase 1: CSS Fixes
- [ ] 1.1 Add `.page-with-hero` class to AboutUsPage
- [ ] 1.2 Add CSS rule for margin-top: -140px
- [ ] 1.3 Verify page-title height matches original (~326px visible)

### Phase 2: Testimonials Carousel
- [ ] 2.1 Install embla-carousel-react
- [ ] 2.2 Refactor TestimonialsSection with Embla
- [ ] 2.3 Add carousel CSS (dots, transitions)
- [ ] 2.4 Test carousel autoplay and navigation

### Phase 3: TeamSection
- [ ] 3.1 Create TeamSection.tsx component
- [ ] 3.2 Create TeamSection.stories.tsx
- [ ] 3.3 Add team data to aboutUs.ts
- [ ] 3.4 Add hover overlay effect for social links

### Phase 4: BlogGridSection
- [ ] 4.1 Create BlogGridSection.tsx component
- [ ] 4.2 Create BlogGridSection.stories.tsx
- [ ] 4.3 Add blog data to aboutUs.ts
- [ ] 4.4 Add hover overlay effect for entry image

### Phase 5: Integration
- [ ] 5.1 Import new sections into AboutUsPage
- [ ] 5.2 Update AboutUsPage.stories.tsx
- [ ] 5.3 Run visual comparison to verify fixes
- [ ] 5.4 Capture new screenshots

---

## Verification

After implementation, re-run the comparison:

```bash
cd ui && npx tsx scripts/compare-about-us.ts
```

Expected results:
- All 18 sections should now PASS
- No missing sections
- Height differences < 10px
- Full page screenshot should match original

---

## Open Questions

1. **Carousel autoplay**: Should testimonials auto-rotate? Original has `data-autoplay="false"`
2. **Header enhancements**: Should we also fix the simplified navigation, or save for separate ticket?
3. **Font Awesome**: Ensure FA icons are loading for social links

---

## Alternatives Considered

### For Hero Height Fix:
- **Rejected: JavaScript height calculation** - Overcomplicated for CSS issue
- **Rejected: Fixed pixel height** - Not responsive

### For Carousel:
- **Rejected: CSS-only carousel** - Poor accessibility, complex
- **Rejected: Owl Carousel** - jQuery dependency not suitable for React

---

## Dependencies

- `embla-carousel-react` - For testimonials carousel
- Font Awesome (already loaded via external.css)
- Bootstrap grid (already loaded)

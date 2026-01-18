---
Title: Assets Template Analysis
Ticket: 2026-01-18-assets-analysis
Status: active
Topics: []
DocType: design-doc
Intent: long-term
Owners: []
RelatedFiles:
    - Path: assets/Hairy/blog-single.html
      Note: Blog single layout
    - Path: assets/Hairy/gallery-3cols.html
      Note: Gallery grid + filter behavior
    - Path: assets/Hairy/index.html
      Note: Homepage 1 section composition and shared header/footer patterns
    - Path: assets/Hairy/page-contact.html
      Note: Contact form + map integration
    - Path: assets/Hairy/page-services.html
      Note: Services/skills/feature/contact section variants
    - Path: assets/Hairy/shop-single.html
      Note: Product detail
    - Path: assets/MAIN_FILES/Documentation/index.html
      Note: Vendor documentation for template structure
ExternalSources: []
Summary: Detailed inventory of HTML pages/components in assets/ and a proposed React widget framework organization.
LastUpdated: 2026-01-18T16:47:00-05:00
WhatFor: Reference for converting Hairy HTML template into React widgets.
WhenToUse: When planning or implementing the React UI extraction for this template.
---


# Assets Template Analysis

## Executive Summary

The `assets/` folder contains a complete HTML template (“Hairy”) with 30+ pages, a shared header/footer layout, and a large set of reusable UI sections (hero sliders, service cards, pricing tables, team grids, testimonials, blog/shop/gallery views, and multiple forms). The pages are built on Bootstrap, jQuery, and a set of plugins (carousel, masonry, instafeed, gmap) with consistent CSS class naming across sections.

This document inventories every page and its section composition, extracts a component inventory, and proposes a React widget framework that organizes the template into composable, variant-driven sections and shared widgets. The goal is to translate static HTML into a maintainable React UI library with data-driven page composition.

## Problem Statement

We need a detailed understanding of all pages and components in `assets/` so the template can be restructured into a React widget framework. Missing any section or widget leads to gaps or duplicated UI work later; incomplete inventory makes it hard to build a stable component hierarchy and define variants.

## Proposed Solution

### 1) Page inventory (all HTML pages in `assets/Hairy/`)

Each page uses a common shell (preloader → header/top-bar/nav → sections → footer) plus page-specific sections. Below is the full inventory, grouped by category with section IDs/classes as found in the HTML.

**Home pages**
- `index.html` (Homepage 1):
  - `#slider` (carousel hero)
  - `#service1` (services-2, 3-card grid)
  - `#working-time` (working hours panels)
  - `#pricing` (pricing-2 list)
  - `#testimonial2` (testimonial-1 carousel)
  - `#blog` (blog grid)
  - `#clients1` (client logo carousel)
- `homepage-2.html`:
  - `#slider2` (carousel hero variant)
  - `#service2` (services-1 grid)
  - `#pricing` (pricing-1 parallax)
  - `#team1` (team grid)
  - `#testimonial2` (testimonial-2 parallax)
  - `#shop` (shop-4 product grid)
- `homepage-3.html`:
  - `#slider` (carousel hero)
  - `#feature1` (feature grid with icons)
  - `#pricing2` (pricing-2 parallax)
  - `#gallery` (gallery grid 3-col)
  - `#testimonial2` (testimonial-2 parallax)
  - `#team1` (team grid)
  - `#contact` (full-width map)
- `landing.html`:
  - `#slider` (carousel hero)
  - `#service1` (services-2)
  - `#working-time` (working hours)
  - `#pricing` (pricing-1)
  - `#Heading` (parallax heading band for testimonials)
  - `#testimonial2` (testimonial-3 on gray)
  - `#booking` (booking-2 form, parallax)

**Core pages**
- `page-about-us.html`:
  - `#page-title`
  - `#video2` (video button / split media)
  - `#counter1` (counter stats)
  - `#team1` (team grid)
  - `#testimonial2` (testimonial-2)
  - `#blog` (blog grid)
- `page-book-online.html`:
  - `#page-title`
  - `#booking` (booking form)
- `page-our-staff.html`:
  - `#page-title`
  - `#team1`
- `page-services.html`:
  - `#page-title`
  - `#service1` (services-1)
  - `#skills2` (skills/progress bars, parallax)
  - `#feature1` (feature grid)
  - `#contact` (full-width map)
- `page-contact.html`:
  - `#page-title`
  - `#contact1` (contact form)
  - `#gMap` (full-width map)
- `page-404.html`:
  - `.page-404` (fullscreen 404 panel)

**Blog pages**
- `blog-grid.html`, `blog-grid-sidebar-left.html`, `blog-grid-sidebar-right.html`:
  - `#page-title`
  - `#blog` (blog grid cards + pagination; sidebar variants add widgets)
- `blog-masonry.html`, `blog-masonry-sidebar-left.html`, `blog-masonry-sidebar-right.html`:
  - `#page-title`
  - `#blog` (masonry cards + pagination; sidebar variants add widgets)
- `blog-standard-sidebar-left.html`, `blog-standard-sidebar-right.html`:
  - `#page-title`
  - `#blog` (standard list layout + sidebar widgets)
- `blog-single.html`:
  - `#page-title`
  - `#blog` (single post, share bar, prev/next, related posts, sidebar widgets)

**Gallery pages**
- `gallery-3cols.html`:
  - `#page-title`
  - `#gallery` (3-col grid with filter + hover overlay)
- `gallery-4cols.html`:
  - `#page-title`
  - `#gallery` (4-col grid with filter + hover overlay)
- `gallery-masonry.html`:
  - `#page-title`
  - `#gallery` (masonry grid + filter)
- `gallery-single-images.html`:
  - `#page-title`
  - `#gallery` (single gallery details with static images)
- `gallery-single-slider.html`:
  - `#page-title`
  - `#gallery` (single gallery details + image carousel)

**Shop pages**
- `shop-3columns.html`, `shop-4columns.html`:
  - `#page-title`
  - `#shop` (product grid + sort controls + pagination)
- `shop-sidebar-left.html`, `shop-sidebar-right.html`:
  - `#page-title`
  - `#shop` (product grid + sidebar widgets)
- `shop-single.html`:
  - `#page-title`
  - `#product` (product details, ratings, quantity, tabs, reviews, related products)
- `shop-cart.html`:
  - `#page-title`
  - `#shopcart` (cart table, quantity stepper, coupon, subtotal, checkout CTA)
- `shop-checkout.html`:
  - `#page-title`
  - `#checkoutAcount` (billing form)
  - `#checkoutSummary` (order summary)
  - `#checkoutPayment` (payment methods)

**Elements / style guide pages**
- `elements-buttons.html`: button variants (size, shape, color, outline) within a section.
- `elements-columns-grids.html`: Bootstrap grid system examples.
- `elements-typography.html`: heading typography samples.
- `elements-form.html`: form controls layout and button usage.
- `elements-heading.html`: heading variants (`heading-1`, `heading-2`).

**Documentation (non-site page)**
- `assets/MAIN_FILES/Documentation/index.html`: vendor documentation for the template structure and assets.

### 2) Component inventory (reusable sections + widgets)

**Global layout**
- Preloader (`.preloader`, `.spinner`, `.bounce*`).
- Wrapper (`#wrapper`, `.wrapper`).
- Header:
  - Top bar: hours + phone + login/register + social.
  - Main nav: logo (light/dark), responsive toggle, dropdown menus (multi-level).
  - Header modules: cart dropdown, search overlay, “Book Online” CTA.
- Footer:
  - Widgets: about + schedule, latest posts list, contact + newsletter.
  - Copyright bar + social icons.

**Page-level sections**
- Page title / hero banner (`#page-title`): background image, title, breadcrumbs; variants in `title-1`, `title-6`.
- Hero slider (`#slider`, `#slider2`): carousel with background image, headline, supporting copy, CTA(s).
- Services (`#service1`, `#service2`): service cards with image + title + description.
- Working hours (`#working-time`): day/time panels on parallax background.
- Pricing (`#pricing`, `#pricing2`): pricing list cards with title, divider, price, description; variant on parallax.
- Features (`#feature1`): icon + title + copy grid.
- Skills (`#skills2`): progress bars + heading CTA.
- Video section (`#video2`): split layout, image background, play button (popup).
- Counter (`#counter1`): stat tiles with icon + number + label.
- Team (`#team1`): member cards with image overlay + social links + name/role.
- Testimonials (`#testimonial2`, plus `testimonial-1/2/3` styles): carousel panels with avatar + quote + name.
- Clients (`#clients1`): logo carousel.
- Booking (`#booking`): form variants (full form vs compact “booking-2”).
- Contact (`#contact`, `#contact1`): contact form; map-only sections with Google Maps plugin.
- 404 (`.page-404`): full-screen error message + CTA.

**Blog components**
- Blog entry card: image + overlay link + meta + title + excerpt + “read more”.
- Blog list / standard: larger entry layout (image + text) + pagination.
- Blog single: title/meta, content, blockquote, share bar, prev/next nav, related posts grid.
- Blog sidebar widgets: search, categories, recent posts, instagram feed, tag cloud.

**Gallery components**
- Gallery filter bar with categories (data-filter).
- Gallery card: image + hover overlay + title + category links.
- Gallery single: image(s) carousel or static grid, description, share bar, metadata list, prev/next nav.

**Shop components**
- Product card: image + hover action + title + price.
- Product list controls: result count, sort select.
- Shop sidebar widgets: search, categories, best sellers, price filter slider, tag cloud.
- Cart dropdown (header module): mini cart list + subtotal + CTA.
- Cart table: line items + quantity stepper + remove + coupon + subtotal + checkout CTA.
- Product detail: rating, availability, quantity stepper, add-to-cart, share icons.
- Product tabs: information table + reviews list + review form.
- Checkout: billing form, order summary, payment methods.

**UI primitives**
- Buttons: primary/secondary/white/outline, rounded variants.
- Forms: inputs, selects with icon, textareas, inline input groups.
- Breadcrumbs, pagination, tabs, ratings, carousels, masonry grids.

### 3) React widget framework organization

**Guiding idea:** model each HTML “section” as a React *widget* (section component) and expose variants via props. Cards and widgets become smaller primitives used inside sections. The page itself becomes a configuration of widgets.

**Suggested component tree (folder-level)**
- `components/layout/`
  - `AppShell`, `Header`, `TopBar`, `NavBar`, `NavMenu`, `Footer`, `PageTitle`, `Preloader`
- `components/sections/`
  - `HeroSlider`, `ServicesSection`, `WorkingHoursSection`, `PricingSection`, `TeamSection`,
    `TestimonialsSection`, `BlogSection`, `GallerySection`, `ShopSection`, `BookingSection`,
    `ContactSection`, `MapSection`, `VideoSection`, `CounterSection`, `SkillsSection`,
    `FeatureSection`, `ClientsCarousel`, `HeadingBand`, `Error404Section`
- `components/cards/`
  - `ServiceCard`, `PricingCard`, `TeamMemberCard`, `TestimonialCard`, `BlogCard`,
    `GalleryCard`, `ProductCard`, `ReviewCard`, `RelatedPostCard`
- `components/widgets/`
  - `Carousel`, `MasonryGrid`, `FilterBar`, `Pagination`, `Breadcrumbs`, `Tabs`, `Rating`,
    `QuantityStepper`, `FormSelect`, `SearchOverlay`, `CartDropdown`,
    `SidebarSearch`, `SidebarCategories`, `SidebarRecentPosts`, `SidebarRecentProducts`,
    `SidebarTags`, `SidebarInstagram`, `SidebarPriceFilter`, `NewsletterForm`
- `components/forms/`
  - `ContactForm`, `BookingForm`, `CheckoutForm`, `ReviewForm`
- `components/commerce/`
  - `CartTable`, `CartSummary`, `ProductDetail`, `ProductTabs`, `CheckoutSummary`,
    `PaymentMethods`
- `pages/`
  - `HomePage`, `HomePage2`, `HomePage3`, `LandingPage`, `AboutPage`, `ServicesPage`,
    `StaffPage`, `ContactPage`, `BookOnlinePage`, `Blog*`, `Gallery*`, `Shop*`, `Error404`

**Variant strategy (examples)**
- `ServicesSection` with `variant="grid-1" | "grid-2"` for `services-1` vs `services-2`.
- `PricingSection` with `variant="pricing-1" | "pricing-2"` and optional `parallax` prop.
- `TestimonialsSection` with `variant="light" | "dark" | "gray"` to match `testimonial-1/2/3`.
- `PageTitle` with `variant` for `title-1`, `title-6` and optional breadcrumb position.
- `GallerySection` with `layout="grid" | "masonry" | "single"` and optional filter bar.

**Data-driven page composition**
Define each page as an ordered array of section configs, e.g.:

```
const homePageSections = [
  { type: "HeroSlider", variant: "slider-1", slides: [...] },
  { type: "ServicesSection", variant: "grid-2", items: [...] },
  { type: "WorkingHoursSection", data: [...] },
  { type: "PricingSection", variant: "pricing-2", items: [...] },
  { type: "TestimonialsSection", variant: "dark", items: [...] },
  { type: "BlogSection", layout: "grid", items: [...] },
  { type: "ClientsCarousel", logos: [...] },
];
```

This keeps the React app close to the template’s structure while enabling reuse and themeing.

## Design Decisions

- **Section-first decomposition:** Each `<section>` becomes a widget component. This mirrors the HTML structure and makes page composition predictable.
- **Variants instead of new components:** Use props/variants to represent `services-1` vs `services-2`, `testimonial-1/2/3`, and other stylistic differences.
- **Shared primitives for repeated patterns:** Carousels, cards, pagination, and sidebar widgets become shared primitives used across pages.
- **Plugin-driven features are wrapped:** Carousel, masonry, gmap, and instafeed are mapped to React equivalents (or wrapper components) to avoid direct jQuery reliance.
- **Page composition stays declarative:** Pages should not re-implement section layout; they should render a list of section configs.

## Alternatives Considered

- **Monolithic page components:** Converting each HTML page directly into one React file would be faster initially but prevents reuse and makes global styling harder to manage.
- **Server-side templating only:** Keeping the HTML as-is with a templating engine ignores the requirement for a React widget framework and doesn’t support component reuse.
- **Direct jQuery plugin reuse:** Wrapping old jQuery plugins in React would lock the app to legacy patterns and complicate SSR or modern build pipelines.

## Implementation Plan

1. Convert shared layout (preloader, header, footer, page title) into React layout components.
2. Build core widgets for repeated sections (services, pricing, team, testimonials, gallery, blog, shop).
3. Implement shared primitives (carousel, pagination, tabs, rating, quantity stepper, filter bar).
4. Create page configs and map each HTML page to a React page file with section arrays.
5. Replace plugin features with React-native equivalents (carousel/masonry/map) and validate parity.
6. Populate mock data based on existing template content; later wire to real APIs/CMS if needed.

## Open Questions

- Which carousel/masonry/map libraries will replace the jQuery plugins while preserving layout parity?
- Do we keep the existing CSS class names (for faster parity) or migrate to a scoped styling system?
- Should sidebar widgets be fully generic (config-driven) or remain blog/shop-specific?
- How will content be sourced (static JSON, CMS, API) once components are built?

## References

- Template HTML pages: `assets/Hairy/*.html`
- Template assets: `assets/Hairy/assets/`
- Vendor documentation: `assets/MAIN_FILES/Documentation/index.html`

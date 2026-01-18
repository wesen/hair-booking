import { CounterSection } from '../components/sections/CounterSection'
import { PageTitleSection } from '../components/sections/PageTitleSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { VideoSection } from '../components/sections/VideoSection'
import {
  aboutUsBreadcrumbs,
  aboutUsCounters,
  aboutUsTestimonials,
  aboutUsVideo,
} from '../data/aboutUs'

export function AboutUsPage() {
  return (
    <main>
      <PageTitleSection
        title="About Us"
        backgroundImageUrl="/hairy/assets/images/page-titles/7.jpg"
        breadcrumbs={aboutUsBreadcrumbs}
      />
      <VideoSection {...aboutUsVideo} />
      <CounterSection items={aboutUsCounters} />
      <TestimonialsSection
        backgroundImageUrl="/hairy/assets/images/background/3.jpg"
        items={aboutUsTestimonials}
      />
    </main>
  )
}

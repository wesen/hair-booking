import { BlogGridSection } from '../components/sections/BlogGridSection'
import { CounterSection } from '../components/sections/CounterSection'
import { PageTitleSection } from '../components/sections/PageTitleSection'
import { TeamSection } from '../components/sections/TeamSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { VideoSection } from '../components/sections/VideoSection'
import {
  aboutUsBlogEntries,
  aboutUsBreadcrumbs,
  aboutUsCounters,
  aboutUsTeamMembers,
  aboutUsTestimonials,
  aboutUsVideo,
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

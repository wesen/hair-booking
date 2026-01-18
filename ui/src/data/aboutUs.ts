import type { BreadcrumbItem } from '../components/sections/PageTitleSection'
import type { CounterItem } from '../components/sections/CounterSection'
import type { Testimonial } from '../components/sections/TestimonialsSection'
import type { VideoSectionProps } from '../components/sections/VideoSection'
import type { TeamMember } from '../components/sections/TeamSection'
import type { BlogEntry } from '../components/sections/BlogGridSection'

export const aboutUsBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us' },
]

export const aboutUsVideo: VideoSectionProps = {
  heading: 'A traditional barbershop with a modern twist.',
  description:
    'Proin ipsum dolor sit amet, consectetur adipisicing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud.',
  signatureUrl: '/hairy/assets/images/icons/signature.png',
  videoThumbnailUrl: '/hairy/assets/images/background/4.jpg',
  videoUrl: 'https://www.youtube.com/watch?v=nrJtHemSPW4',
}

export const aboutUsCounters: CounterItem[] = [
  {
    iconUrl: '/hairy/assets/images/icons/1.png',
    value: '18',
    label: 'Skilled Barbers',
  },
  {
    iconUrl: '/hairy/assets/images/icons/7.png',
    value: '140',
    label: 'Happy Clients',
  },
  {
    iconUrl: '/hairy/assets/images/icons/8.png',
    value: '370',
    label: 'Custom Haircuts',
  },
  {
    iconUrl: '/hairy/assets/images/icons/9.png',
    value: '16',
    label: 'Years Experience',
  },
]

export const aboutUsTestimonials: Testimonial[] = [
  {
    quote:
      "It's just brilliant. I will recommend Hairy to everyone I know! I'm really glad to these guys got Hairy out there.",
    name: 'Steve Martin',
  },
  {
    quote:
      'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure.',
    name: 'Ryan Printz',
  },
  {
    quote:
      'Cillum dolore eu fugiat nulla pariatur occaecat cupidatat non proident sunt in culpa.',
    name: 'Steve Martin',
  },
]

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

export const aboutUsBlogEntries: BlogEntry[] = [
  {
    title: 'Foil shaver versus clippers & trimmers',
    excerpt:
      'Are you a dedicated razor shaver? dude who hasn\'t really thought about trying a different..',
    imageUrl: '/hairy/assets/images/blog/grid/1.jpg',
    date: 'Oct 20, 2017',
    category: 'barbers',
  },
  {
    title: 'Men\'s hairstyles for all face shapes',
    excerpt:
      'Most of the time, men don\'t know the haircuts that suit their face shape - but don\'t worry, we\'re here to..',
    imageUrl: '/hairy/assets/images/blog/grid/2.jpg',
    date: 'Oct 15, 2017',
    category: 'Styles',
  },
  {
    title: 'Basic tips for styling men\'s hair',
    excerpt:
      'The first tip is to choose a hairstyle that\'s realistic for your lifestyle, hair type, and general image..',
    imageUrl: '/hairy/assets/images/blog/grid/3.jpg',
    date: 'Oct 25, 2017',
    category: 'Haircut',
  },
]

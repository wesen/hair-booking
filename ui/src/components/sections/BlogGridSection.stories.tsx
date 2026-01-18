import type { Meta, StoryObj } from '@storybook/react'
import { BlogGridSection } from './BlogGridSection'

const meta: Meta<typeof BlogGridSection> = {
  title: 'Sections/BlogGridSection',
  component: BlogGridSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof BlogGridSection>

export const Default: Story = {
  args: {
    heading: 'Our Blog Posts',
    description:
      'Duis aute irure dolor in reprehenderit volupte velit esse cillum dolore eu fugiat pariatursint occaecat cupidatat non proident culpa.',
    entries: [
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
    ],
    showViewMore: true,
  },
}

export const WithoutViewMore: Story = {
  args: {
    heading: 'Latest Articles',
    entries: [
      {
        title: 'Foil shaver versus clippers & trimmers',
        excerpt: 'Are you a dedicated razor shaver?',
        imageUrl: '/hairy/assets/images/blog/grid/1.jpg',
        date: 'Oct 20, 2017',
        category: 'barbers',
      },
      {
        title: 'Men\'s hairstyles for all face shapes',
        excerpt: 'Most of the time, men don\'t know the haircuts...',
        imageUrl: '/hairy/assets/images/blog/grid/2.jpg',
        date: 'Oct 15, 2017',
        category: 'Styles',
      },
    ],
    showViewMore: false,
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { TeamSection } from './TeamSection'

const meta: Meta<typeof TeamSection> = {
  title: 'Sections/TeamSection',
  component: TeamSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof TeamSection>

export const Default: Story = {
  args: {
    heading: 'Skilled Barbers',
    description:
      'Duis aute irure dolor in reprehenderit volupte velit esse cillum dolore eu fugiat pariatursint occaecat cupidatat non proident culpa.',
    members: [
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
    ],
  },
}

export const WithoutHeading: Story = {
  args: {
    members: [
      {
        name: 'Ryan Printz',
        role: 'Barber',
        imageUrl: '/hairy/assets/images/team/grid/1.jpg',
        socialLinks: { facebook: '#', twitter: '#' },
      },
      {
        name: 'Steve Martin',
        role: 'Barber',
        imageUrl: '/hairy/assets/images/team/grid/2.jpg',
        socialLinks: { facebook: '#' },
      },
    ],
  },
}

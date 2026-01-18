import type { Meta, StoryObj } from '@storybook/react'
import { TestimonialsSection } from './TestimonialsSection'

const meta: Meta<typeof TestimonialsSection> = {
  title: 'Sections/TestimonialsSection',
  component: TestimonialsSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof TestimonialsSection>

export const Default: Story = {
  args: {
    backgroundImageUrl: '/hairy/assets/images/background/3.jpg',
    items: [
      {
        quote:
          'It’s just brilliant. I will recommend Hairy to everyone I know! I’m really glad to these guys got Hairy out there.',
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
    ],
  },
}

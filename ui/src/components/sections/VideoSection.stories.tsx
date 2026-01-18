import type { Meta, StoryObj } from '@storybook/react'
import { VideoSection } from './VideoSection'

const meta: Meta<typeof VideoSection> = {
  title: 'Sections/VideoSection',
  component: VideoSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof VideoSection>

export const Default: Story = {
  args: {
    heading: 'A traditional barbershop with a modern twist.',
    description:
      'Proin ipsum dolor sit amet, consectetur adipisicing elit, sed eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud.',
    signatureUrl: '/hairy/assets/images/icons/signature.png',
    videoThumbnailUrl: '/hairy/assets/images/background/4.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=nrJtHemSPW4',
  },
}

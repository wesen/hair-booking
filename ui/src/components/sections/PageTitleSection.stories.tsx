import type { Meta, StoryObj } from '@storybook/react'
import { PageTitleSection } from './PageTitleSection'

const meta: Meta<typeof PageTitleSection> = {
  title: 'Sections/PageTitleSection',
  component: PageTitleSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof PageTitleSection>

export const Default: Story = {
  args: {
    title: 'About Us',
    backgroundImageUrl: '/hairy/assets/images/page-titles/7.jpg',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'About Us' },
    ],
  },
}

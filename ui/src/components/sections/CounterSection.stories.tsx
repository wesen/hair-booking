import type { Meta, StoryObj } from '@storybook/react'
import { CounterSection } from './CounterSection'

const meta: Meta<typeof CounterSection> = {
  title: 'Sections/CounterSection',
  component: CounterSection,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof CounterSection>

export const Default: Story = {
  args: {
    items: [
      { iconUrl: '/hairy/assets/images/icons/1.png', value: '18', label: 'Skilled Barbers' },
      { iconUrl: '/hairy/assets/images/icons/7.png', value: '140', label: 'Happy Clients' },
      { iconUrl: '/hairy/assets/images/icons/8.png', value: '370', label: 'Custom Haircuts' },
      { iconUrl: '/hairy/assets/images/icons/9.png', value: '16', label: 'Years Experience' },
    ],
  },
}

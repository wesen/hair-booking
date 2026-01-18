import type { Meta, StoryObj } from '@storybook/react'
import { AboutUsPage } from './AboutUsPage'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'

const meta: Meta<typeof AboutUsPage> = {
  title: 'Pages/AboutUsPage',
  component: AboutUsPage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof AboutUsPage>

export const FullPage: Story = {
  render: () => (
    <div id="wrapper" className="wrapper clearfix">
      <Header />
      <AboutUsPage />
      <Footer />
    </div>
  ),
}

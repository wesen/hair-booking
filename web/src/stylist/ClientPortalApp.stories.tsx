import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ClientPortalApp } from "./ClientPortalApp";
import { createTestStore } from "./store/test-utils";
import "./styles/stylist.css";
import "./styles/theme-default.css";

const meta = {
  title: "Stylist/ClientPortalApp",
  component: ClientPortalApp,
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <Story />
      </Provider>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ClientPortalApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};

export const Appointments: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ portal: { screen: "appointments", activeTab: "appointments" } })}>
        <Story />
      </Provider>
    ),
  ],
};

export const Photos: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ portal: { screen: "photos", activeTab: "photos" } })}>
        <Story />
      </Provider>
    ),
  ],
};

export const Rewards: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ portal: { screen: "rewards", activeTab: "rewards" } })}>
        <Story />
      </Provider>
    ),
  ],
};

export const Profile: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ portal: { screen: "profile", activeTab: "home" } })}>
        <Story />
      </Provider>
    ),
  ],
};

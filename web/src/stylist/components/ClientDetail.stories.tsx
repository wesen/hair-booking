import type { Meta, StoryObj } from "@storybook/react";
import { ClientDetail } from "./ClientDetail";
import { INITIAL_CLIENTS } from "../data/constants";

const meta: Meta<typeof ClientDetail> = {
  title: "Stylist/ClientDetail",
  component: ClientDetail,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 430, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClientDetail>;

export const DefaultClient: Story = {
  args: {
    client: INITIAL_CLIENTS[0], // Mia Chen
  },
};

export const VIPClient: Story = {
  args: {
    client: INITIAL_CLIENTS[3], // Sophia Rivera, Diamond tier
  },
};

export const NewClient: Story = {
  args: {
    client: INITIAL_CLIENTS[4], // Emma Williams, few visits
  },
};

export const ClientWithUpcoming: Story = {
  args: {
    client: { ...INITIAL_CLIENTS[2], upcoming: "Mar 28 at 1:00 PM" }, // Olivia Park with upcoming
  },
};

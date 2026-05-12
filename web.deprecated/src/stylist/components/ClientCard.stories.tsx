import type { Meta, StoryObj } from "@storybook/react";
import { ClientCard } from "./ClientCard";
import { INITIAL_CLIENTS } from "../data/constants";

const meta: Meta<typeof ClientCard> = {
  title: "Stylist/ClientCard",
  component: ClientCard,
};

export default meta;
type Story = StoryObj<typeof ClientCard>;

export const Default: Story = {
  args: {
    client: INITIAL_CLIENTS[0],
  },
};

export const VIPClient: Story = {
  args: {
    client: INITIAL_CLIENTS[3],
  },
};

export const NewClient: Story = {
  args: {
    client: INITIAL_CLIENTS[4],
  },
};

export const AllClients: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {INITIAL_CLIENTS.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  ),
};

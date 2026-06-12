import type { Meta, StoryObj } from "@storybook/react";
import { BackendAdminDslPage } from "./BackendAdminDslPage";

const meta: Meta<typeof BackendAdminDslPage> = {
  title: "Admin DSL/Services/Live Backend",
  component: BackendAdminDslPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Dev-only live backend smoke story. Requires the Go server and /api/admin-dsl protobuf endpoints; keep static/MSW stories as deterministic screenshot sources.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BackendAdminDslPage>;

export const ServicesAdminFlow: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

const meta: Meta<typeof Modal> = {
  title: "Stylist/Modal",
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: 16 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 8 }}>
          Welcome
        </h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
          This is a sample modal with some content inside. You can close it by
          tapping the overlay behind the sheet.
        </p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 4 }}>
          Add Note
        </h2>
        <Input placeholder="Enter your note..." />
        <Button>Save Note</Button>
      </div>
    ),
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { DslPageRenderer } from "./render";
import { dslExamples, serviceDsl } from "./examples";
import type { DslPage } from "./schema";

const actions = {
  next: () => console.log("dsl next"),
  back: () => console.log("dsl back"),
  skip: () => console.log("dsl skip"),
  editService: () => console.log("edit service"),
  editColor: () => console.log("edit color"),
  editLength: () => console.log("edit length"),
};

function PhoneDslStory({ page }: { page: DslPage }) {
  return <DslPageRenderer page={page} context={{ actions }} />;
}

const meta: Meta<typeof PhoneDslStory> = {
  title: "Page DSL/Rendered Pages",
  component: PhoneDslStory,
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj<typeof PhoneDslStory>;

export const Service: Story = { args: { page: dslExamples.service } };
export const Color: Story = { args: { page: dslExamples.color } };
export const Length: Story = { args: { page: dslExamples.length } };
export const Photos: Story = { args: { page: dslExamples.photos } };
export const Budget: Story = { args: { page: dslExamples.budget } };
export const Estimate: Story = { args: { page: dslExamples.estimate } };
export const Booking: Story = { args: { page: dslExamples.booking } };
export const Confirm: Story = { args: { page: dslExamples.confirm } };

export const JsonContract: Story = {
  name: "JSON contract",
  parameters: { phone: false, layout: "padded" },
  render: () => (
    <pre style={{ fontSize: 12, maxWidth: 960, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(serviceDsl, null, 2)}
    </pre>
  ),
};

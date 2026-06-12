import type { Meta, StoryObj } from "@storybook/react";
import { DslPageRenderer } from "./render";
import { experimentalDslExamples } from "./experimental";
import type { DslPage } from "./schema";

const actions = {
  next: () => console.log("experimental next"),
  back: () => console.log("experimental back"),
  skip: () => console.log("experimental skip"),
  done: () => console.log("experimental done"),
  message: () => console.log("experimental message stylist"),
};

function ExperimentalDslStory({ page }: { page: DslPage }) {
  return <DslPageRenderer page={page} context={{ actions }} />;
}

const meta: Meta<typeof ExperimentalDslStory> = {
  title: "Page DSL/Experimental Compositions",
  component: ExperimentalDslStory,
  parameters: { layout: "fullscreen", phone: true },
};

export default meta;
type Story = StoryObj<typeof ExperimentalDslStory>;

export const ConsultationDashboard: Story = {
  args: { page: experimentalDslExamples.consultationDashboard },
};

export const AppointmentPlanner: Story = {
  args: { page: experimentalDslExamples.appointmentPlanner },
};

export const ColorLab: Story = {
  args: { page: experimentalDslExamples.colorLab },
};

export const PhotoMoodboard: Story = {
  args: { page: experimentalDslExamples.photoMoodboard },
};

export const AftercarePlan: Story = {
  args: { page: experimentalDslExamples.aftercarePlan },
};

export const ExperimentalJsonIndex: Story = {
  name: "Experimental JSON index",
  parameters: { phone: false, layout: "padded" },
  render: () => (
    <pre style={{ fontSize: 12, maxWidth: 960, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(experimentalDslExamples, null, 2)}
    </pre>
  ),
};

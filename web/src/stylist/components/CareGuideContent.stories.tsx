import type { Meta, StoryObj } from "@storybook/react";
import { CareGuideContent } from "./CareGuideContent";
import { CARE_GUIDE_SECTIONS } from "../data/consultation-constants";

const meta: Meta<typeof CareGuideContent> = {
  title: "Stylist/Consultation/CareGuideContent",
  component: CareGuideContent,
};

export default meta;
type Story = StoryObj<typeof CareGuideContent>;

export const Default: Story = {
  args: {
    sections: CARE_GUIDE_SECTIONS,
  },
};

export const CustomPhone: Story = {
  args: {
    sections: CARE_GUIDE_SECTIONS,
    contactPhone: "(555) 123-4567",
  },
};

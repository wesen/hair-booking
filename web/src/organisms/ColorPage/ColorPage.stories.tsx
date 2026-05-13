import type { Meta, StoryObj } from "@storybook/react";
import { ColorPage } from "./ColorPage";
import { Provider } from "react-redux";
import { createRuntimeStore } from "../../store";

const store = createRuntimeStore();

const meta: Meta<typeof ColorPage> = {
  title: "Organisms/ColorPage",
  component: ColorPage,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Provider store={store}><Story/></Provider>],
};

export default meta;
type Story = StoryObj<typeof ColorPage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { ExtensionsPage } from "./ExtensionsPage";
import { Provider } from "react-redux";
import { createRuntimeStore } from "../../store";

const store = createRuntimeStore();

const meta: Meta<typeof ExtensionsPage> = {
  title: "Pages/ExtensionsPage",
  component: ExtensionsPage,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Provider store={store}><Story/></Provider>],
};

export default meta;
type Story = StoryObj<typeof ExtensionsPage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};

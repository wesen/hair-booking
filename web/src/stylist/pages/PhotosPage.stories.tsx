import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PhotosPage } from "./PhotosPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PhotosPage> = {
  title: "Stylist/Pages/PhotosPage",
  component: PhotosPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "photos" as const,
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "extensions" as const },
        },
      })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PhotosPage>;

export const Default: Story = {};

const withPhotosStore = createTestStore({
  consultation: {
    screen: "photos" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      photoFront: "photo_front_123",
      photoBack: "photo_back_456",
      photoHairline: "photo_hairline_789",
      inspoPhotos: ["inspo_1", "inspo_2"],
    },
  },
});

export const WithPhotos: Story = {
  decorators: [
    (Story) => (
      <Provider store={withPhotosStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const colorOnlyStore = createTestStore({
  consultation: {
    screen: "photos" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "color" as const,
    },
  },
});

export const ColorOnly: Story = {
  decorators: [
    (Story) => (
      <Provider store={colorOnlyStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

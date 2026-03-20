import type { Preview } from "@storybook/react";
import "../src/stylist/styles/stylist.css";
import "../src/stylist/styles/theme-default.css";

const MOBILE_VIEWPORTS = {
  iPhoneSE: {
    name: "iPhone SE",
    styles: { width: "375px", height: "667px" },
  },
  iPhone14: {
    name: "iPhone 14",
    styles: { width: "390px", height: "844px" },
  },
  iPhone14ProMax: {
    name: "iPhone 14 Pro Max",
    styles: { width: "430px", height: "932px" },
  },
  pixel7: {
    name: "Pixel 7",
    styles: { width: "412px", height: "915px" },
  },
  samsungGalaxyS23: {
    name: "Samsung Galaxy S23",
    styles: { width: "360px", height: "780px" },
  },
  iPadMini: {
    name: "iPad Mini",
    styles: { width: "768px", height: "1024px" },
  },
  narrow: {
    name: "Narrow (320px)",
    styles: { width: "320px", height: "568px" },
  },
};

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "salon",
      values: [
        { name: "salon", value: "#faf7f5" },
        { name: "dark", value: "#1a1412" },
        { name: "white", value: "#ffffff" },
      ],
    },
    viewport: {
      viewports: MOBILE_VIEWPORTS,
      defaultViewport: "iPhone14ProMax",
    },
  },
};

export default preview;

import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { VerifyCodePage } from "./VerifyCodePage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof VerifyCodePage> = {
  title: "Stylist/Pages/VerifyCodePage",
  component: VerifyCodePage,
};

export default meta;
type Story = StoryObj<typeof VerifyCodePage>;

const baseAuth = {
  loginIdentifier: "mia.k@email.com",
  codeSentTo: "mia.k@email.com",
  codeDigits: ["", "", "", "", "", ""],
  isVerifying: true,
  isAuthenticated: false,
  error: null,
  resendCooldown: 42,
  showDepositSheet: false,
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardZip: "",
  paymentError: null,
  paymentProcessing: false,
};

export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ auth: { ...baseAuth } })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export const PartialCode: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ auth: { ...baseAuth, codeDigits: ["4", "8", "2", "", "", ""] } })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export const WithError: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ auth: { ...baseAuth, codeDigits: ["4", "8", "2", "9", "1", ""], error: "Invalid code. Please try again." } })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export const CooldownExpired: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({ auth: { ...baseAuth, resendCooldown: 0 } })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

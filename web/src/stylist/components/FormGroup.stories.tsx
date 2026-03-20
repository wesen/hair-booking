import type { Meta, StoryObj } from "@storybook/react";
import { FormGroup } from "./FormGroup";
import { RadioOption } from "./RadioOption";

const meta: Meta<typeof FormGroup> = {
  title: "Stylist/Consultation/FormGroup",
  component: FormGroup,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSelect: Story = {
  render: () => (
    <FormGroup label="Hair Length" required>
      <select data-part="select-input">
        <option value="">Select...</option>
        <option value="above">Above shoulders</option>
        <option value="shoulder">Shoulder length</option>
        <option value="past">Past shoulders</option>
        <option value="mid">Mid-back</option>
        <option value="waist">Waist length</option>
      </select>
    </FormGroup>
  ),
};

export const WithTextInput: Story = {
  render: () => (
    <FormGroup label="Dream Result" hint="Describe what you'd love your hair to look like.">
      <input data-part="text-input" placeholder="e.g. long, blended, natural-looking extensions" />
    </FormGroup>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <FormGroup label="Hair Density" required>
      <div data-part="radio-group">
        <RadioOption>Fine / thin</RadioOption>
        <RadioOption selected>Medium</RadioOption>
        <RadioOption>Thick</RadioOption>
      </div>
    </FormGroup>
  ),
};

export const WithHint: Story = {
  render: () => (
    <FormGroup label="Budget Range" hint="This helps us recommend the best options for you.">
      <select data-part="select-input">
        <option value="">Select...</option>
        <option value="under500">Under $500</option>
        <option value="500-800">$500 - $800</option>
        <option value="800-1200">$800 - $1,200</option>
      </select>
    </FormGroup>
  ),
};

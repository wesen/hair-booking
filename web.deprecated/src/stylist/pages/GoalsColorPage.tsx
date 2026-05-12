import { useAppSelector, useAppDispatch } from "../store";
import { updateData, goNext } from "../store/consultationSlice";
import { FormGroup } from "../components/FormGroup";
import { Icon } from "../components/Icon";
import { COLOR_BUDGET_RANGES } from "../data/consultation-constants";

export function GoalsColorPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const canContinue = !!data.budget;

  return (
    <div data-part="page-content">
      <div data-part="section-label">YOUR GOALS</div>
      <div data-part="section-heading">Budget & Timeline</div>
      <div data-part="section-sub">Almost there — just a couple more details.</div>

      <FormGroup label="Budget range for initial service" hint="We'll let you know if this is realistic for your goals. No surprises.">
        <select
          data-part="select-input"
          value={data.budget}
          onChange={e => dispatch(updateData({ budget: e.target.value }))}
        >
          <option value="">Select your budget...</option>
          {COLOR_BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </FormGroup>

      <FormGroup label="Any deadline? (event, wedding, etc.)">
        <input
          data-part="text-input"
          type="text"
          placeholder="e.g. Wedding on April 15"
          value={data.deadline || ""}
          onChange={e => dispatch(updateData({ deadline: e.target.value }))}
        />
      </FormGroup>

      <FormGroup label="Describe your dream result">
        <textarea
          data-part="text-input"
          placeholder="e.g. I want to go from brunette to a warm honey blonde without damage..."
          value={data.dreamResult || ""}
          onChange={e => dispatch(updateData({ dreamResult: e.target.value }))}
          style={{ minHeight: 80, resize: "vertical" }}
        />
      </FormGroup>

      <button
        data-part="btn-accent"
        disabled={!canContinue}
        onClick={() => dispatch(goNext())}
      >
        <Icon name="sparkle" size={16} /> See My Estimate
      </button>
    </div>
  );
}

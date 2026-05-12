import { useAppSelector, useAppDispatch } from "../store";
import { updateData, goNext } from "../store/consultationSlice";
import { FormGroup } from "../components/FormGroup";
import { RadioOption } from "../components/RadioOption";
import { ExtTypeCard } from "../components/ExtTypeCard";
import { LengthSlider } from "../components/LengthSlider";
import { Icon } from "../components/Icon";
import { EXT_TYPES, BUDGET_RANGES, MAINT_OPTIONS } from "../data/consultation-constants";

export function GoalsExtPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const canContinue = data.extType && data.budget && data.maintenance;

  return (
    <div data-part="page-content">
      <div data-part="section-label">YOUR GOALS</div>
      <div data-part="section-heading">What's Your Vision?</div>
      <div data-part="section-sub">Tell us about your dream hair so we can give you a realistic estimate.</div>

      <FormGroup label="Desired length">
        <LengthSlider
          value={data.desiredLength}
          onChange={v => dispatch(updateData({ desiredLength: v }))}
        />
      </FormGroup>

      <FormGroup label="Extension type preference">
        {EXT_TYPES.map(t => (
          <ExtTypeCard
            key={t.id}
            extType={t}
            selected={data.extType === t.id}
            onClick={() => dispatch(updateData({ extType: t.id }))}
          />
        ))}
      </FormGroup>

      <FormGroup label="Budget range" hint="We'll let you know if this is realistic for your goals. No surprises.">
        <select
          data-part="select-input"
          value={data.budget}
          onChange={e => dispatch(updateData({ budget: e.target.value }))}
        >
          <option value="">Select your budget...</option>
          {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </FormGroup>

      <FormGroup label="Maintenance commitment">
        <div data-part="radio-group">
          {MAINT_OPTIONS.map(m => (
            <RadioOption
              key={m}
              selected={data.maintenance === m}
              onClick={() => dispatch(updateData({ maintenance: m }))}
            >
              {m}
            </RadioOption>
          ))}
        </div>
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

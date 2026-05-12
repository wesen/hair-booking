import { useAppSelector, useAppDispatch } from "../store";
import { updateData, goNext } from "../store/consultationSlice";
import { FormGroup } from "../components/FormGroup";
import { RadioOption } from "../components/RadioOption";
import { Icon } from "../components/Icon";
import { HAIR_LENGTHS, HAIR_DENSITY, HAIR_TEXTURE, PREV_EXT_OPTIONS } from "../data/consultation-constants";

export function IntakeExtPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const canContinue = data.hairLength && data.hairDensity && data.hairTexture && data.prevExtensions;

  return (
    <div data-part="page-content">
      <div data-part="section-label">TELL US ABOUT YOUR HAIR</div>
      <div data-part="section-heading">Hair Profile</div>
      <div data-part="section-sub">This helps us give you an accurate estimate and prep for your visit.</div>

      <FormGroup label="Current hair length">
        <select
          data-part="select-input"
          value={data.hairLength}
          onChange={e => dispatch(updateData({ hairLength: e.target.value }))}
        >
          <option value="">Select...</option>
          {HAIR_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </FormGroup>

      <FormGroup label="Hair density">
        <div data-part="radio-group">
          {HAIR_DENSITY.map(d => (
            <RadioOption
              key={d}
              selected={data.hairDensity === d}
              onClick={() => dispatch(updateData({ hairDensity: d }))}
            >
              {d}
            </RadioOption>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Natural hair texture">
        <div data-part="radio-group">
          {HAIR_TEXTURE.map(t => (
            <RadioOption
              key={t}
              selected={data.hairTexture === t}
              onClick={() => dispatch(updateData({ hairTexture: t }))}
            >
              {t}
            </RadioOption>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Any previous extensions?">
        <select
          data-part="select-input"
          value={data.prevExtensions}
          onChange={e => dispatch(updateData({ prevExtensions: e.target.value }))}
        >
          <option value="">Select...</option>
          {PREV_EXT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </FormGroup>

      <button
        data-part="btn-primary"
        disabled={!canContinue}
        onClick={() => dispatch(goNext())}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        Next <Icon name="chevRight" size={16} />
      </button>
    </div>
  );
}

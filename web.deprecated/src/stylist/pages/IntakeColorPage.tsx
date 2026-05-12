import { useAppSelector, useAppDispatch } from "../store";
import { updateData, toggleChemicalHistory, goNext } from "../store/consultationSlice";
import { FormGroup } from "../components/FormGroup";
import { RadioOption } from "../components/RadioOption";
import { CheckPill } from "../components/CheckPill";
import { Icon } from "../components/Icon";
import { COLOR_SERVICES, CHEMICAL_HISTORY } from "../data/consultation-constants";

export function IntakeColorPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const canContinue = !!data.colorService;

  return (
    <div data-part="page-content">
      <div data-part="section-label">COLOR CONSULTATION</div>
      <div data-part="section-heading">Tell Us About Your Color</div>
      <div data-part="section-sub">Helps us understand your starting point and goals.</div>

      <FormGroup label="What are you looking for?">
        <div data-part="radio-group">
          {COLOR_SERVICES.map(s => (
            <RadioOption
              key={s.id}
              selected={data.colorService === s.id}
              onClick={() => dispatch(updateData({ colorService: s.id }))}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{s.desc}</div>
              </div>
            </RadioOption>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Natural hair color level (1 = black, 10 = lightest blonde)">
        <input
          data-part="text-input"
          type="text"
          placeholder="e.g. 6 (dark blonde)"
          value={data.naturalLevel}
          onChange={e => dispatch(updateData({ naturalLevel: e.target.value }))}
        />
      </FormGroup>

      <FormGroup label="Current color description">
        <input
          data-part="text-input"
          type="text"
          placeholder="e.g. Box dyed medium brown with grown-out roots"
          value={data.currentColor}
          onChange={e => dispatch(updateData({ currentColor: e.target.value }))}
        />
      </FormGroup>

      <FormGroup label="Previous chemical services">
        <div data-part="check-grid">
          {CHEMICAL_HISTORY.map(c => (
            <CheckPill
              key={c}
              label={c}
              checked={data.chemicalHistory.includes(c)}
              onClick={() => dispatch(toggleChemicalHistory(c))}
            />
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Last chemical service & when">
        <input
          data-part="text-input"
          type="text"
          placeholder="e.g. Highlights, 3 months ago"
          value={data.lastChemical}
          onChange={e => dispatch(updateData({ lastChemical: e.target.value }))}
        />
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

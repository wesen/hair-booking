// Fringe intake — Estimate page (step 7 of 9)
// Replaces: ConsultEstimatePage
// API: reads from servicesApi.getIntake() response → { estimate_low, estimate_high }

import { color, font } from "../../fringe-ui/tokens";
import { IntakeShell } from "../../fringe-ui/layout/IntakeShell";
import { Masthead } from "../../fringe-ui/salon-widgets/Masthead";
import { SummaryRow } from "../../fringe-ui/salon-widgets/SummaryRow";
import { Note } from "../../fringe-ui/primitives/Note";

interface EstimatePageProps {
  estimateLow: number;
  estimateHigh: number;
  service: string;
  colorLevel: string;
  length: string;
  addOns?: string;
  onNext: () => void;
  onBack: () => void;
}

export function EstimatePage({
  estimateLow,
  estimateHigh,
  service,
  colorLevel,
  length,
  addOns,
  onNext,
  onBack,
}: EstimatePageProps) {
  const midpoint = Math.round((estimateLow + estimateHigh) / 2);
  const duration = "3h 15m";

  return (
    <IntakeShell
      step={7}
      total={9}
      eyebrow="Chapter VII · The Quote"
      title="Your estimate"
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue to booking →"
    >
      <Masthead
        eyebrow="ESTIMATED TOTAL"
        title={`$${midpoint}`}
        right={duration}
        compact
      />

      <div style={{ height: 16 }} />

      <SummaryRow label="Service"    value={service}        onEdit={() => {}} />
      <SummaryRow label="Color level" value={colorLevel}   onEdit={() => {}} />
      <SummaryRow label="Length"    value={length}           onEdit={() => {}} />
      {addOns && <SummaryRow label="Add-ons" value={addOns} />}

      <div style={{ marginTop: 20 }}>
        <Note tone="warn">
          Estimate only. Final cost depends on in-salon assessment of current color and condition.
        </Note>
      </div>
    </IntakeShell>
  );
}

// ── Desktop variant (Butter accent panel)
export function EstimatePageDesktop({
  estimateLow,
  estimateHigh,
  service,
  onBook,
}: {
  estimateLow: number;
  estimateHigh: number;
  service: string;
  onBook: () => void;
}) {
  const midpoint = Math.round((estimateLow + estimateHigh) / 2);
  const accent = color.butter;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: color.paper }}>
      {/* Left — white panel */}
      <div style={{ flex: 1.15, padding: "48px 56px" }}>
        <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase" as const, color: color.plum, marginBottom: 10 }}>
          Chapter VII · The Quote
        </div>
        <div style={{
          fontFamily: font.block,
          fontSize: 84,
          textTransform: "uppercase" as const,
          letterSpacing: -1.5,
          color: color.ink,
          lineHeight: 0.9,
          marginBottom: 8,
        }}>
          Your<br />estimate.
        </div>
        <div style={{
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 22,
          color: color.softInk,
          maxWidth: 440,
          marginTop: 14,
        }}>
          Based on what you've shared. Final number depends on an in-chair look.
        </div>

        <div style={{ marginTop: 48, borderTop: `1px solid ${color.rule}` }}>
          <SummaryRow label="Service" value={service} onEdit={() => {}} />
          <SummaryRow label="Add-ons" value="Olaplex bond treatment · $45" />
        </div>

        <div style={{ marginTop: 32 }}>
          <Note tone="warn">
            Color corrections or unexpected length may adjust the final quote in-salon.
          </Note>
        </div>
      </div>

      {/* Right — butter panel */}
      <div style={{
        background: accent,
        padding: "56px 56px 48px",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between" as const,
        minHeight: 680,
      }}>
        <div>
          <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase" as const, color: color.plumDeep }}>
            ESTIMATED · USD
          </div>
          <div style={{
            fontFamily: font.block,
            fontSize: 220,
            textTransform: "uppercase" as const,
            letterSpacing: -6,
            lineHeight: 0.82,
            color: color.ink,
            marginTop: 12,
          }}>
            ${midpoint}
          </div>
          <div style={{
            fontFamily: font.serif,
            fontStyle: "italic",
            fontSize: 26,
            color: color.plumDeep,
            marginTop: 8,
          }}>
            {Math.round(estimateLow / 60 * 100)}min.
          </div>
        </div>

        <div>
          {[
            { k: "LOW", v: `$${estimateLow}` },
            { k: "LIKELY", v: `$${midpoint}` },
            { k: "HIGH", v: `$${estimateHigh}` },
          ].map((row) => (
            <div key={row.k} style={{
              padding: "16px 0",
              borderTop: `1px solid ${color.ink}`,
              display: "flex",
              justifyContent: "space-between" as const,
            }}>
              <div style={{ fontFamily: font.mono, fontSize: 11, color: color.ink }}>{row.k}</div>
              <div style={{ fontFamily: font.block, fontSize: 26, textTransform: "uppercase" as const, color: color.ink }}>{row.v}</div>
            </div>
          ))}
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button style={{
              fontFamily: font.block,
              textTransform: "uppercase" as const,
              padding: "14px 20px",
              border: `1px solid ${color.ink}`,
              background: "transparent",
              color: color.ink,
              cursor: "pointer",
            }}>
              Adjust
            </button>
            <button
              onClick={onBook}
              style={{
                fontFamily: font.block,
                textTransform: "uppercase" as const,
                padding: "14px 20px",
                border: "none",
                background: color.ink,
                color: color.paper,
                cursor: "pointer",
                flex: 1,
              }}
            >
              Continue to booking →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstimatePage;
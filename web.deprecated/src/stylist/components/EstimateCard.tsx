import type { PriceEstimate } from "../types";

interface EstimateCardProps {
  estimate: PriceEstimate;
  serviceLabel: string;
  maintenance?: string;
}

export function EstimateCard({ estimate, serviceLabel, maintenance }: EstimateCardProps) {
  return (
    <div data-part="estimate-card" style={{ position: "relative", zIndex: 1 }}>
      <div data-part="estimate-label">Your Estimate</div>
      <div data-part="estimate-service">{serviceLabel}</div>
      <div data-part="estimate-price">
        ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
      </div>
      <div data-part="estimate-detail">initial appointment</div>
      {estimate.moveUpLow > 0 && (
        <>
          <div data-part="estimate-divider" />
          <div data-part="estimate-detail">
            Move-ups: ${estimate.moveUpLow}–${estimate.moveUpHigh}<br />
            {maintenance || "every 6–8 weeks"}
          </div>
        </>
      )}
    </div>
  );
}

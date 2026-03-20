import { useAppSelector, useAppDispatch } from "../store";
import { goNext } from "../store/consultationSlice";
import { openDepositSheet } from "../store/authSlice";
import { EstimateCard } from "../components/EstimateCard";
import { Hint } from "../components/Hint";
import { Icon } from "../components/Icon";
import { estimatePrice } from "../utils/estimate";
import { EXT_TYPES, COLOR_SERVICES } from "../data/consultation-constants";

export function ConsultEstimatePage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const estimate = estimatePrice(data);

  const extName = EXT_TYPES.find(t => t.id === data.extType)?.name || "Extensions";
  const colorName = COLOR_SERVICES.find(s => s.id === data.colorService)?.name || "Color Service";
  const lengthLabels = ["Current length", "Shoulder length", "Mid-back", "Waist length", "Beyond waist"];

  let serviceLabel = "";
  if (data.serviceType === "extensions" || data.serviceType === "both") {
    serviceLabel += `${extName} · ${lengthLabels[data.desiredLength]}`;
  }
  if (data.serviceType === "color" || data.serviceType === "both") {
    if (serviceLabel) serviceLabel += " + ";
    serviceLabel += colorName;
  }

  return (
    <div data-part="page-content">
      <EstimateCard
        estimate={estimate}
        serviceLabel={serviceLabel}
        maintenance={data.maintenance}
      />

      <Hint>
        This is a ballpark based on your photos and info. Your final quote is given at your consult — no surprises.
      </Hint>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        <button data-part="btn-accent" onClick={() => dispatch(goNext())}>
          ✨ Book Free Consult — 15 min
        </button>
        <button
          data-part="btn-primary"
          onClick={() => dispatch(openDepositSheet())}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Icon name="dollar" size={16} /> Book + Pay $75 Deposit — skip the wait
        </button>
      </div>

      <Hint>
        Deposit applies to your first service. Skip the waitlist and lock in your spot.
      </Hint>
    </div>
  );
}

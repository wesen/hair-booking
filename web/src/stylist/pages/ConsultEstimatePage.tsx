import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { goNext, updateData } from "../store/consultationSlice";
import { openDepositSheet } from "../store/authSlice";
import { getApiErrorMessage, mapConsultationDataToIntakeRequest, useCreateIntakeMutation, useUploadIntakePhotoMutation } from "../store/api";
import { getPendingConsultationPhoto, listPendingInspirationPhotos } from "../store/consultationUploads";
import { EstimateCard } from "../components/EstimateCard";
import { Hint } from "../components/Hint";
import { Icon } from "../components/Icon";
import { estimatePrice } from "../utils/estimate";
import { EXT_TYPES, COLOR_SERVICES } from "../data/consultation-constants";

export function ConsultEstimatePage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const [createIntake] = useCreateIntakeMutation();
  const [uploadIntakePhoto] = useUploadIntakePhotoMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const estimate = estimatePrice(data);
  const displayedEstimate = data.estimateLow !== null && data.estimateHigh !== null
    ? { ...estimate, low: data.estimateLow, high: data.estimateHigh }
    : estimate;

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

  const persistIntake = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const submission = await createIntake(mapConsultationDataToIntakeRequest(data)).unwrap();

      const nextData = {
        intakeId: submission.id,
        estimateLow: submission.estimate_low,
        estimateHigh: submission.estimate_high,
        photoFront: data.photoFront,
        photoBack: data.photoBack,
        photoHairline: data.photoHairline,
        inspoPhotos: data.inspoPhotos,
      };

      const frontPhoto = getPendingConsultationPhoto("photoFront");
      if (frontPhoto) {
        const uploaded = await uploadIntakePhoto({ intakeId: submission.id, slot: "front", file: frontPhoto }).unwrap();
        nextData.photoFront = uploaded.url;
      }

      const backPhoto = getPendingConsultationPhoto("photoBack");
      if (backPhoto) {
        const uploaded = await uploadIntakePhoto({ intakeId: submission.id, slot: "back", file: backPhoto }).unwrap();
        nextData.photoBack = uploaded.url;
      }

      const hairlinePhoto = getPendingConsultationPhoto("photoHairline");
      if (hairlinePhoto) {
        const uploaded = await uploadIntakePhoto({ intakeId: submission.id, slot: "hairline", file: hairlinePhoto }).unwrap();
        nextData.photoHairline = uploaded.url;
      }

      const inspoUploads: string[] = [];
      for (const file of listPendingInspirationPhotos()) {
        const uploaded = await uploadIntakePhoto({ intakeId: submission.id, slot: "inspo", file }).unwrap();
        inspoUploads.push(uploaded.url);
      }
      if (inspoUploads.length > 0) {
        nextData.inspoPhotos = inspoUploads;
      }

      dispatch(updateData(nextData));
      return submission;
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "We could not save your intake yet."));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-part="page-content">
      <EstimateCard
        estimate={displayedEstimate}
        serviceLabel={serviceLabel}
        maintenance={data.maintenance}
      />

      <Hint>
        This is a ballpark based on your photos and info. Your final quote is given at your consult — no surprises.
      </Hint>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
        <button
          data-part="btn-accent"
          disabled={isSubmitting}
          onClick={async () => {
            const submission = await persistIntake();
            if (submission) {
              dispatch(goNext());
            }
          }}
        >
          ✨ Book Free Consult — 15 min
        </button>
        <button
          data-part="btn-primary"
          disabled={isSubmitting}
          onClick={async () => {
            const submission = await persistIntake();
            if (submission) {
              dispatch(openDepositSheet());
            }
          }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Icon name="dollar" size={16} /> Book + Pay $75 Deposit — skip the wait
        </button>
      </div>

      {submitError && (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--color-danger)", fontSize: 13 }}>
          {submitError}
        </div>
      )}

      <Hint>
        Deposit applies to your first service. Skip the waitlist and lock in your spot.
      </Hint>
    </div>
  );
}

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import { goNext, updateData } from "../store/consultationSlice";
import { getApiErrorMessage, mapConsultationDataToIntakeRequest, useCreateIntakeMutation, useUploadIntakePhotoMutation } from "../store/api";
import {
  clearPendingConsultationPhoto,
  clearPendingConsultationUploads,
  getPendingConsultationPhoto,
  listPendingInspirationPhotos,
  replacePendingInspirationPhotos,
} from "../store/consultationUploads";
import { EstimateCard } from "../components/EstimateCard";
import { Hint } from "../components/Hint";
import { Icon } from "../components/Icon";
import { estimatePrice } from "../utils/estimate";
import { EXT_TYPES, COLOR_SERVICES } from "../data/consultation-constants";

interface ConsultEstimatePageProps {
  showDepositOption?: boolean;
}

function isUploadedPhotoReference(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/uploads/");
}

export function ConsultEstimatePage({ showDepositOption = true }: ConsultEstimatePageProps) {
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
  const pendingRequiredUploads = [getPendingConsultationPhoto("photoFront"), getPendingConsultationPhoto("photoBack"), getPendingConsultationPhoto("photoHairline")]
    .filter((file) => file !== null).length;
  const pendingInspoUploads = listPendingInspirationPhotos().length;
  const totalPendingUploads = pendingRequiredUploads + pendingInspoUploads;
  const retryMode = data.intakeId !== null && totalPendingUploads > 0;

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
      const nextData = {
        intakeId: data.intakeId,
        estimateLow: data.estimateLow,
        estimateHigh: data.estimateHigh,
        photoFront: data.photoFront,
        photoBack: data.photoBack,
        photoHairline: data.photoHairline,
        inspoPhotos: data.inspoPhotos,
      };
      let intakeId = data.intakeId;

      if (!intakeId) {
        const submission = await createIntake(mapConsultationDataToIntakeRequest(data)).unwrap();
        intakeId = submission.id;
        nextData.intakeId = submission.id;
        nextData.estimateLow = submission.estimate_low;
        nextData.estimateHigh = submission.estimate_high;
        dispatch(updateData({
          intakeId: submission.id,
          estimateLow: submission.estimate_low,
          estimateHigh: submission.estimate_high,
        }));
      }

      const failedUploads: string[] = [];

      const frontPhoto = getPendingConsultationPhoto("photoFront");
      if (frontPhoto) {
        try {
          const uploaded = await uploadIntakePhoto({ intakeId, slot: "front", file: frontPhoto }).unwrap();
          nextData.photoFront = uploaded.url;
          clearPendingConsultationPhoto("photoFront");
          dispatch(updateData({ photoFront: uploaded.url }));
        } catch (error) {
          failedUploads.push(`front (${getApiErrorMessage(error, "upload failed")})`);
        }
      }

      const backPhoto = getPendingConsultationPhoto("photoBack");
      if (backPhoto) {
        try {
          const uploaded = await uploadIntakePhoto({ intakeId, slot: "back", file: backPhoto }).unwrap();
          nextData.photoBack = uploaded.url;
          clearPendingConsultationPhoto("photoBack");
          dispatch(updateData({ photoBack: uploaded.url }));
        } catch (error) {
          failedUploads.push(`back (${getApiErrorMessage(error, "upload failed")})`);
        }
      }

      const hairlinePhoto = getPendingConsultationPhoto("photoHairline");
      if (hairlinePhoto) {
        try {
          const uploaded = await uploadIntakePhoto({ intakeId, slot: "hairline", file: hairlinePhoto }).unwrap();
          nextData.photoHairline = uploaded.url;
          clearPendingConsultationPhoto("photoHairline");
          dispatch(updateData({ photoHairline: uploaded.url }));
        } catch (error) {
          failedUploads.push(`hairline (${getApiErrorMessage(error, "upload failed")})`);
        }
      }

      const inspoUploads = nextData.inspoPhotos.filter(isUploadedPhotoReference);
      const remainingInspiration: File[] = [];
      for (const file of listPendingInspirationPhotos()) {
        try {
          const uploaded = await uploadIntakePhoto({ intakeId, slot: "inspo", file }).unwrap();
          inspoUploads.push(uploaded.url);
        } catch (error) {
          remainingInspiration.push(file);
          failedUploads.push(`${file.name} (${getApiErrorMessage(error, "upload failed")})`);
        }
      }
      replacePendingInspirationPhotos(remainingInspiration);
      nextData.inspoPhotos = [...inspoUploads, ...remainingInspiration.map((file) => file.name)];
      dispatch(updateData({
        intakeId: nextData.intakeId,
        estimateLow: nextData.estimateLow,
        estimateHigh: nextData.estimateHigh,
        inspoPhotos: nextData.inspoPhotos,
      }));

      if (failedUploads.length > 0) {
        const remainingCount = remainingInspiration.length
          + [getPendingConsultationPhoto("photoFront"), getPendingConsultationPhoto("photoBack"), getPendingConsultationPhoto("photoHairline")]
            .filter((file) => file !== null).length;
        setSubmitError(
          `Your intake is already saved. Retry the remaining ${remainingCount} upload${remainingCount === 1 ? "" : "s"}: ${failedUploads.join(", ")}.`,
        );
        return null;
      }

      clearPendingConsultationUploads();
      dispatch(updateData(nextData));
      return { id: intakeId };
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
          {retryMode ? "Retry Pending Uploads" : "✨ Book Free Consult — 15 min"}
        </button>
        {showDepositOption ? (
          <button
            data-part="btn-primary"
            disabled={isSubmitting}
            onClick={async () => {
              const submission = await persistIntake();
              if (submission) {
                dispatch(goNext());
              }
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Icon name="dollar" size={16} /> {retryMode ? "Retry Uploads + Continue" : "Book + Pay $75 Deposit — skip the wait"}
          </button>
        ) : null}
      </div>

      {retryMode ? (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
          Your intake is already saved. Retrying here will only upload the remaining photos instead of creating a duplicate intake.
        </div>
      ) : null}

      {submitError && (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--color-danger)", fontSize: 13 }}>
          {submitError}
        </div>
      )}

      {showDepositOption ? (
        <Hint>
          Deposit applies to your first service. Skip the waitlist and lock in your spot.
        </Hint>
      ) : null}
    </div>
  );
}

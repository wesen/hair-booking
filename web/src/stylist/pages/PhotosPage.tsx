import { useAppSelector, useAppDispatch } from "../store";
import { goNext, updateData } from "../store/consultationSlice";
import { addPendingInspirationPhoto, setPendingConsultationPhoto } from "../store/consultationUploads";
import { PhotoBox } from "../components/PhotoBox";
import { Icon } from "../components/Icon";

export function PhotosPage() {
  const dispatch = useAppDispatch();
  const data = useAppSelector(s => s.consultation.data);
  const hasRequired = data.photoFront && data.photoBack;
  const showHairline = data.serviceType === "extensions" || data.serviceType === "both";

  return (
    <div data-part="page-content">
      <div data-part="section-label">PHOTO UPLOAD</div>
      <div data-part="section-heading">Show Us Your Hair</div>
      <div data-part="section-sub">Helps us give you an accurate estimate and prep for your visit.</div>

      <div data-part="form-label">
        Current hair <span style={{ color: "var(--color-accent)" }}>(required)</span>
      </div>
      <div data-part="photo-grid">
        <PhotoBox
          label="Front"
          hasPhoto={!!data.photoFront}
          onFileSelect={(file) => {
            setPendingConsultationPhoto("photoFront", file);
            dispatch(updateData({ photoFront: file.name }));
          }}
        />
        <PhotoBox
          label="Back"
          hasPhoto={!!data.photoBack}
          onFileSelect={(file) => {
            setPendingConsultationPhoto("photoBack", file);
            dispatch(updateData({ photoBack: file.name }));
          }}
        />
      </div>

      {showHairline && (
        <>
          <div data-part="form-label">Hairline close-up</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <PhotoBox
              label="Hairline"
              hasPhoto={!!data.photoHairline}
              onFileSelect={(file) => {
                setPendingConsultationPhoto("photoHairline", file);
                dispatch(updateData({ photoHairline: file.name }));
              }}
            />
            <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, padding: "0 4px" }}>
              Helps us check extension placement options near your hairline
            </div>
          </div>
        </>
      )}

      <div data-part="form-label">
        Inspiration pics <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
      </div>
      <div data-part="photo-grid">
        <PhotoBox
          label={data.inspoPhotos.length > 0 ? `${data.inspoPhotos.length} added` : "Add inspo"}
          hasPhoto={data.inspoPhotos.length > 0}
          onFileSelect={(file) => {
            addPendingInspirationPhoto(file);
            dispatch(updateData({ inspoPhotos: [...data.inspoPhotos, file.name] }));
          }}
        />
        <PhotoBox
          label="Add more"
          onFileSelect={(file) => {
            addPendingInspirationPhoto(file);
            dispatch(updateData({ inspoPhotos: [...data.inspoPhotos, file.name] }));
          }}
        />
      </div>

      <button
        data-part="btn-primary"
        disabled={!hasRequired}
        onClick={() => dispatch(goNext())}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        Next <Icon name="chevRight" size={16} />
      </button>
    </div>
  );
}

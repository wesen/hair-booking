import { useAppSelector, useAppDispatch } from "../store";
import { simulatePhoto, addInspoPhoto, goNext } from "../store/consultationSlice";
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
          onClick={() => dispatch(simulatePhoto("photoFront"))}
        />
        <PhotoBox
          label="Back"
          hasPhoto={!!data.photoBack}
          onClick={() => dispatch(simulatePhoto("photoBack"))}
        />
      </div>

      {showHairline && (
        <>
          <div data-part="form-label">Hairline close-up</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <PhotoBox
              label="Hairline"
              hasPhoto={!!data.photoHairline}
              onClick={() => dispatch(simulatePhoto("photoHairline"))}
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
          onClick={() => dispatch(addInspoPhoto())}
        />
        <PhotoBox
          label="Add more"
          onClick={() => dispatch(addInspoPhoto())}
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

export type ConsultationPhotoSlot = "photoFront" | "photoBack" | "photoHairline";

const pendingPhotos = new Map<ConsultationPhotoSlot, File>();
const pendingInspirationPhotos: File[] = [];

export function setPendingConsultationPhoto(slot: ConsultationPhotoSlot, file: File) {
  pendingPhotos.set(slot, file);
}

export function clearPendingConsultationPhoto(slot: ConsultationPhotoSlot) {
  pendingPhotos.delete(slot);
}

export function addPendingInspirationPhoto(file: File) {
  pendingInspirationPhotos.push(file);
}

export function getPendingConsultationPhoto(slot: ConsultationPhotoSlot): File | null {
  return pendingPhotos.get(slot) ?? null;
}

export function listPendingInspirationPhotos(): File[] {
  return [...pendingInspirationPhotos];
}

export function replacePendingInspirationPhotos(files: File[]) {
  pendingInspirationPhotos.length = 0;
  pendingInspirationPhotos.push(...files);
}

export function clearPendingConsultationUploads() {
  pendingPhotos.clear();
  pendingInspirationPhotos.length = 0;
}

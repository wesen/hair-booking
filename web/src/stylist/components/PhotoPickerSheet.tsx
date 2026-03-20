import { Modal } from "./Modal";
import { Icon } from "./Icon";

interface PhotoPickerSheetProps {
  onTakePhoto: () => void;
  onChooseLibrary: () => void;
  onClose: () => void;
}

export function PhotoPickerSheet({ onTakePhoto, onChooseLibrary, onClose }: PhotoPickerSheetProps) {
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: "4px 0 8px" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400, marginBottom: 16 }}>
          Add Photo
        </div>

        <div
          data-part="photo-picker-option"
          onClick={onTakePhoto}
          role="button"
          tabIndex={0}
        >
          <Icon name="camera" size={20} />
          Take Photo
        </div>

        <div
          data-part="photo-picker-option"
          onClick={onChooseLibrary}
          role="button"
          tabIndex={0}
        >
          <Icon name="upload" size={20} />
          Choose from Library
        </div>

        <button
          data-part="signin-link"
          onClick={onClose}
          style={{ display: "block", margin: "12px auto 0", fontSize: 14 }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

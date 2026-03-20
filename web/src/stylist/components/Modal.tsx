interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div data-part="modal-overlay" onClick={onClose}>
      <div data-part="modal-sheet" onClick={e => e.stopPropagation()}>
        <div data-part="modal-handle" />
        {children}
      </div>
    </div>
  );
}

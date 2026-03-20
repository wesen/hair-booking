interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return <div data-part="toast">{message}</div>;
}

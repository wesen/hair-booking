import { Icon } from "./Icon";

interface ConsultNavBarProps {
  title: string;
  stepNum: number;
  totalSteps: number;
  onBack: () => void;
}

export function ConsultNavBar({ title, stepNum, totalSteps, onBack }: ConsultNavBarProps) {
  return (
    <>
      <div data-part="nav-bar">
        <button data-part="nav-back" onClick={onBack}>
          <Icon name="back" size={20} />
        </button>
        <span data-part="nav-title">{title}</span>
        {totalSteps > 0 && (
          <span data-part="nav-step">{stepNum}/{totalSteps}</span>
        )}
      </div>
      {totalSteps > 0 && (
        <div data-part="progress-bar">
          <div
            data-part="progress-fill"
            style={{ width: `${(stepNum / totalSteps) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}

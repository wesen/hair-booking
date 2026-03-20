import type { NotificationPref } from "../types";

interface NotificationPrefsProps {
  prefs: NotificationPref[];
  onToggle: (key: string) => void;
}

export function NotificationPrefs({ prefs, onToggle }: NotificationPrefsProps) {
  return (
    <div>
      {prefs.map(p => (
        <div key={p.key} data-part="pref-toggle">
          <span>{p.label}</span>
          <button
            data-part="pref-toggle-switch"
            data-on={p.on || undefined}
            onClick={() => onToggle(p.key)}
            role="switch"
            aria-checked={p.on}
          />
        </div>
      ))}
    </div>
  );
}

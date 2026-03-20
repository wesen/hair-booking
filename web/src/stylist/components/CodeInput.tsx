import { useRef, useCallback } from "react";

interface CodeInputProps {
  digits: string[];
  onChange: (index: number, value: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
}

export function CodeInput({ digits, onChange, onComplete, error }: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    onChange(index, digit);

    // Auto-advance to next input
    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }

    // Check if complete
    if (digit && index === 5) {
      const code = digits.map((d, i) => (i === index ? digit : d)).join("");
      if (code.length === 6 && onComplete) {
        onComplete(code);
      }
    }
  }, [digits, onChange, onComplete]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    pasted.split("").forEach((digit, i) => {
      onChange(i, digit);
    });
    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
    if (pasted.length === 6 && onComplete) {
      onComplete(pasted);
    }
  }, [onChange, onComplete]);

  return (
    <div data-part="code-input-wrap" data-error={error || undefined}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          data-part="code-digit"
          data-filled={digit ? true : undefined}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

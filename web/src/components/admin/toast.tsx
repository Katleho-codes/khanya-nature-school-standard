"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";

type Tone = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  toast: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-4 top-4 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:top-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[18px] border-2 border-b-4 px-4 py-3 text-[0.86rem] font-semibold shadow-[0_6px_0_rgba(34,40,74,0.12)] ${
              item.tone === "error"
                ? "border-poppy-deep bg-poppy-deep text-white"
                : item.tone === "info"
                  ? "border-sky-deep/30 bg-sky-tint text-ink"
                  : "border-meadow-deep/30 bg-meadow-tint text-ink"
            }`}
          >
            {item.tone === "success" ? (
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-meadow-deep" />
            ) : null}
            <p className="flex-1 leading-relaxed">{item.message}</p>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-75 transition-colors hover:bg-paper/25 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

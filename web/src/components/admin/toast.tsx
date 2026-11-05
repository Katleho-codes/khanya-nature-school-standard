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
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border px-4 py-3 text-[0.84rem] shadow-[0_8px_24px_rgba(22,39,31,0.12)] ${
              item.tone === "error"
                ? "border-clay bg-paper text-clay"
                : item.tone === "info"
                  ? "border-line-strong bg-paper text-bark"
                  : "border-forest bg-forest text-oat"
            }`}
          >
            {item.tone === "success" ? (
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
            ) : null}
            <p className="flex-1 leading-relaxed">{item.message}</p>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="shrink-0 opacity-65 transition-opacity hover:opacity-100"
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

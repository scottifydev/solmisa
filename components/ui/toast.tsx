"use client";

import { useEffect, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-correct bg-correct/10 text-correct",
  error: "border-incorrect bg-incorrect/10 text-incorrect",
  info: "border-steel bg-obsidian text-ivory",
};

export function Toast({ message, variant = "info", duration = 4000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-3 shadow-lg
        font-body text-sm transition-all duration-200
        ${variantClasses[variant]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {message}
    </div>
  );
}

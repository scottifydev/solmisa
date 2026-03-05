"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

const icons: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
  info: "\u24D8",
};

const iconColors: Record<ToastType, string> = {
  success: "text-correct",
  error: "text-incorrect",
  info: "text-info",
};

let toastId = 0;
let listeners: Array<(toast: ToastData) => void> = [];

export function toast(props: {
  message: string;
  type?: ToastType;
  duration?: number;
}) {
  const data: ToastData = {
    id: ++toastId,
    message: props.message,
    type: props.type ?? "info",
    duration: props.duration ?? 3000,
  };
  listeners.forEach((fn) => fn(data));
}

function ToastItem({
  data,
  onClose,
}: {
  data: ToastData;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, data.duration);
    return () => clearTimeout(timer);
  }, [data.duration, onClose]);

  return (
    <div
      role="alert"
      className={`
        flex items-center gap-2 bg-graphite border border-steel rounded-lg px-4 py-3
        shadow-elevated font-body text-sm text-ivory
        transition-all duration-200
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      <span className={iconColors[data.type]}>{icons[data.type]}</span>
      {data.message}
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (t: ToastData) => setToasts((prev) => [...prev, t]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          data={t}
          onClose={() => setToasts((prev) => prev.filter((p) => p.id !== t.id))}
        />
      ))}
    </div>
  );
}

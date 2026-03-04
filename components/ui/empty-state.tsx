import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

function DefaultIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="max-w-xs mx-auto text-center py-16">
      <div className="text-ash mb-6">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className="font-display text-lg text-ivory">{title}</h3>
      {message && (
        <p className="text-sm text-silver mt-2">{message}</p>
      )}
      {action && (
        <div className="mt-8">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="secondary">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="secondary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

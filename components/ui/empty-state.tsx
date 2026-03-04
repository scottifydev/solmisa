import type { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="text-4xl mb-4 text-silver">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-ivory mb-1">{title}</h3>
      {description && (
        <p className="text-silver text-sm max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

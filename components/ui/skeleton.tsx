interface SkeletonProps {
  className?: string;
}

export function SkeletonRect({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-steel rounded-lg ${className}`} />
  );
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-steel rounded-full ${className}`} />
  );
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-steel rounded h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

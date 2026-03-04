interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function SkeletonRect({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-steel rounded-md ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCircle({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-steel rounded-full ${className}`}
      style={{ width: width ?? height, height: height ?? width }}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-steel rounded-sm h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <Logo size={48} glow />
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">
            Page not found
          </h1>
          <p className="text-silver text-sm mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-coral text-white text-sm font-body font-medium hover:bg-coral/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

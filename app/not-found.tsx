import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

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
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}

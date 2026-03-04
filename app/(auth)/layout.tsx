import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo size={48} glow withWordmark wordmarkSize={28} layout="stacked" />
      </div>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}

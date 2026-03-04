import { AppShell } from "@/components/ui/app-shell";
import { AudioProvider } from "@/components/audio-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <AppShell>{children}</AppShell>
    </AudioProvider>
  );
}

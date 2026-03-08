import { AppShell } from "@/components/ui/app-shell";
import { AudioProvider } from "@/components/audio-provider";
import { getNavStats } from "@/lib/actions/dashboard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { streak, reviewCount, newLessonCount, flowDueCount } =
    await getNavStats();

  return (
    <AudioProvider>
      <AppShell
        streak={streak}
        reviewCount={reviewCount}
        newLessonCount={newLessonCount}
        flowDueCount={flowDueCount}
      >
        {children}
      </AppShell>
    </AudioProvider>
  );
}

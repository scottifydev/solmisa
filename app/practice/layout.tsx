import type { Metadata } from "next";
import { PracticeNav } from "@/components/practice/practice-nav";

export const metadata: Metadata = { title: "Practice Drills" };

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-night">
      <PracticeNav />
      <main className="pb-16">{children}</main>
    </div>
  );
}

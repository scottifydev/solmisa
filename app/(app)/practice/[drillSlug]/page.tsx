import type { Metadata } from "next";
import { getDrillConfig } from "@/lib/actions/practice";
import { DrillRunner } from "@/components/practice/drill-runner";
import { MelodicDictationDrill } from "@/components/practice/melodic-dictation-drill";
import { ChordProgressionDrill } from "@/components/practice/chord-progression-drill";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ drillSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { drillSlug } = await params;
  const drill = await getDrillConfig(drillSlug);
  return { title: drill?.title ?? "Practice" };
}

export default async function DrillPage({ params }: Props) {
  const { drillSlug } = await params;
  const drill = await getDrillConfig(drillSlug);

  if (!drill) {
    notFound();
  }

  if (drill.drill_type === "melodic_dictation") {
    return <MelodicDictationDrill drill={drill} />;
  }
  if (drill.drill_type === "chord_progression") {
    return <ChordProgressionDrill drill={drill} />;
  }

  return <DrillRunner drill={drill} />;
}

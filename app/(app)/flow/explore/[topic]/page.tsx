import { notFound } from "next/navigation";
import { DegreeExplorer } from "@/components/flow/explorers/degree-explorer";
import { ChordQualityExplorer } from "@/components/flow/explorers/chord-quality-explorer";
import { IntervalExplorer } from "@/components/flow/explorers/interval-explorer";
import { ModeExplorer } from "@/components/flow/explorers/mode-explorer";
import { KeySignatureExplorer } from "@/components/flow/explorers/key-signature-explorer";
import { RhythmExplorer } from "@/components/flow/explorers/rhythm-explorer";
import { NoteReadingExplorer } from "@/components/flow/explorers/note-reading-explorer";
import { InversionExplorer } from "@/components/flow/explorers/inversion-explorer";

const explorers: Record<
  string,
  { title: string; component: React.ComponentType }
> = {
  "scale-degrees": {
    title: "Scale Degree Explorer",
    component: DegreeExplorer,
  },
  "chord-quality": {
    title: "Chord Quality Explorer",
    component: ChordQualityExplorer,
  },
  intervals: { title: "Interval Explorer", component: IntervalExplorer },
  modes: { title: "Mode Explorer", component: ModeExplorer },
  "key-signatures": {
    title: "Key Signature Explorer",
    component: KeySignatureExplorer,
  },
  rhythm: { title: "Rhythm Explorer", component: RhythmExplorer },
  "note-reading": {
    title: "Note Reading Explorer",
    component: NoteReadingExplorer,
  },
  inversions: {
    title: "Chord Inversion Explorer",
    component: InversionExplorer,
  },
};

export function generateStaticParams() {
  return Object.keys(explorers).map((topic) => ({ topic }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  // Next.js 15 async params — but generateMetadata can accept the promise directly
  // We need to handle it synchronously for the static generation case
  return params.then((p) => {
    const entry = explorers[p.topic];
    return { title: entry?.title ?? "Explorer" };
  });
}

export default async function ExploreTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const entry = explorers[topic];

  if (!entry) notFound();

  const Explorer = entry.component;
  return <Explorer />;
}

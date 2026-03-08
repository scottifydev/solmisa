import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNextStreamCard } from "@/lib/actions/flow";
import { FlowStream } from "@/components/flow/flow-stream";

export const metadata: Metadata = {
  title: "Flow Stream",
};

interface Props {
  searchParams: Promise<{ chain?: string }>;
}

export default async function FlowStreamPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const focusChain = params.chain;

  const initialCard = await getNextStreamCard(focusChain);

  if (!initialCard) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <h1 className="font-display text-xl font-bold text-ivory">
          All caught up
        </h1>
        <p className="text-sm text-silver">
          No cards due right now. New material unlocks as you progress.
        </p>
        <a
          href="/flow"
          className="inline-block rounded-xl bg-violet px-6 py-2.5 text-sm font-semibold text-night"
        >
          Back to Flow
        </a>
      </div>
    );
  }

  return <FlowStream initialCard={initialCard} focusChain={focusChain} />;
}

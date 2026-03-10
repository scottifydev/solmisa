import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { activateStarterChains } from "@/lib/chains/chain-activator";
import { getFlowState } from "@/lib/actions/flow";
import { FlowChainList } from "@/components/flow/flow-chain-list";

export const metadata: Metadata = {
  title: "Flow",
};

export default async function FlowPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Activate any cold-start chains not yet in user_chain_progress.
  // Runs every visit but is idempotent — skips already-active chains.
  await activateStarterChains(user.id);

  const flowState = await getFlowState();

  // Auto-start: skip landing page when cards are due
  if (flowState.totalDue > 0) {
    redirect("/flow/stream");
  }

  return <FlowChainList state={flowState} />;
}

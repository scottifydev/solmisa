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

  // Check if user has any chain progress
  const { count } = await supabase
    .from("user_chain_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    // First visit — activate cold-start chains
    await activateStarterChains(user.id);
  }

  const flowState = await getFlowState();

  // Auto-start: skip landing page when cards are due
  if (flowState.totalDue > 0) {
    redirect("/flow/stream");
  }

  return <FlowChainList state={flowState} />;
}

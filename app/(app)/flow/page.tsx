import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { activateStarterChains } from "@/lib/chains/chain-activator";
import { getFlowState } from "@/lib/actions/flow";

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

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-ivory">Flow</h1>
        <p className="text-sm text-silver">
          {flowState.hasChains
            ? `${flowState.chains.length} chain${flowState.chains.length !== 1 ? "s" : ""} active — ${flowState.totalDue} card${flowState.totalDue !== 1 ? "s" : ""} due`
            : "No chains available yet. Complete lessons to unlock chains."}
        </p>
      </div>

      {flowState.chains.length > 0 && (
        <ul className="space-y-3">
          {flowState.chains.map((chain) => (
            <li
              key={chain.slug}
              className="rounded-xl border border-steel bg-obsidian p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ivory">
                  {chain.name}
                </span>
                {chain.dueCount > 0 && (
                  <span className="rounded-full bg-violet/20 px-2 py-0.5 text-xs font-medium text-violet">
                    {chain.dueCount} due
                  </span>
                )}
              </div>
              <p className="text-xs text-ash">
                {chain.highestUnlocked} / {chain.totalLinks} links unlocked
                {chain.completedOnce ? " — completed" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

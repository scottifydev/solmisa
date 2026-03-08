"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import type { FlowState } from "@/lib/chains/types";
import type { ChainMapData } from "@/lib/actions/flow";
import { getChainMapData } from "@/lib/actions/flow";
import { ChainMap } from "./chain-map";

interface FlowChainListProps {
  state: FlowState;
}

export function FlowChainList({ state }: FlowChainListProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [mapData, setMapData] = useState<ChainMapData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggleMap = async (slug: string) => {
    if (expandedSlug === slug) {
      setExpandedSlug(null);
      setMapData(null);
      return;
    }

    setExpandedSlug(slug);
    setLoading(true);
    const data = await getChainMapData(slug);
    setMapData(data);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-ivory">Flow</h1>
        <p className="text-sm text-silver">
          {state.hasChains
            ? `${state.chains.length} chain${state.chains.length !== 1 ? "s" : ""} active \u2014 ${state.totalDue} card${state.totalDue !== 1 ? "s" : ""} due`
            : "No chains available yet. Complete lessons to unlock chains."}
        </p>
      </div>

      {state.chains.length > 0 && (
        <ul className="space-y-3">
          {state.chains.map((chain) => (
            <li
              key={chain.slug}
              className="rounded-xl border border-steel bg-obsidian overflow-hidden"
            >
              <div className="p-4 space-y-1">
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
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ash">
                    {chain.highestUnlocked} / {chain.totalLinks} links unlocked
                    {chain.completedOnce ? " \u2014 completed" : ""}
                  </p>
                  {chain.completedOnce && (
                    <button
                      onClick={() => handleToggleMap(chain.slug)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: brand.violet }}
                    >
                      {expandedSlug === chain.slug ? "Hide Map" : "View Map"}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded chain map */}
              {expandedSlug === chain.slug && (
                <div
                  className="border-t px-4 py-5"
                  style={{ borderColor: brand.steel }}
                >
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet border-t-transparent" />
                    </div>
                  ) : mapData ? (
                    <ChainMap chain={mapData.chain} links={mapData.links} />
                  ) : (
                    <p
                      className="text-center text-xs"
                      style={{ color: brand.ash }}
                    >
                      Unable to load map data.
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

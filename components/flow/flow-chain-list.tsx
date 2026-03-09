"use client";

import { useState } from "react";
import Link from "next/link";
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
            ? "All caught up. New material unlocks as you progress."
            : "No chains available yet. Complete lessons to unlock chains."}
        </p>
      </div>

      {/* Start Flow button */}
      {state.hasChains && (
        <Link
          href="/flow/stream"
          className="block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition-colors"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Start
        </Link>
      )}

      {state.chains.filter((c) => c.completedOnce).length > 0 && (
        <ul className="space-y-3">
          {state.chains
            .filter((c) => c.completedOnce)
            .map((chain) => (
              <li
                key={chain.slug}
                className="rounded-xl border border-steel bg-obsidian overflow-hidden"
              >
                <div className="p-4 space-y-2">
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

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 flex-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: brand.steel }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(chain.highestUnlocked / chain.totalLinks) * 100}%`,
                          backgroundColor: chain.completedOnce
                            ? brand.correct
                            : brand.violet,
                        }}
                      />
                    </div>
                    <span className="text-xs text-ash">
                      {chain.highestUnlocked}/{chain.totalLinks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Focus link */}
                    <Link
                      href={`/flow/stream?chain=${chain.slug}`}
                      className="text-xs font-medium transition-colors"
                      style={{ color: brand.silver }}
                    >
                      Focus
                    </Link>
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

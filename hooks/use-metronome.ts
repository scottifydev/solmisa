"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/components/audio-provider";
import { MetronomeService, type MetronomeOptions } from "@/lib/audio/metronome";

export interface UseMetronomeReturn {
  start: (options: MetronomeOptions) => Promise<void>;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  bpm: number;
}

export function useMetronome(): UseMetronomeReturn {
  const { ensureStarted } = useAudioContext();
  const metRef = useRef<MetronomeService | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(120);

  const getMetronome = useCallback(() => {
    if (!metRef.current) {
      metRef.current = new MetronomeService();
    }
    return metRef.current;
  }, []);

  const start = useCallback(
    async (options: MetronomeOptions) => {
      await ensureStarted();
      const met = getMetronome();
      met.start(options);
      setIsPlaying(true);
      setBpmState(options.bpm);
    },
    [ensureStarted, getMetronome],
  );

  const stop = useCallback(() => {
    metRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const setBpm = useCallback((newBpm: number) => {
    metRef.current?.setBpm(newBpm);
    setBpmState(newBpm);
  }, []);

  const setVolume = useCallback((volume: number) => {
    metRef.current?.setVolume(volume);
  }, []);

  useEffect(() => {
    return () => {
      metRef.current?.dispose();
      metRef.current = null;
    };
  }, []);

  return { start, stop, setBpm, setVolume, isPlaying, bpm };
}

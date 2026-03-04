"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/components/audio-provider";
import { PlaybackEngine } from "@/lib/audio/playback";
import type {
  DiatonicDegree,
  PlayDegreeOptions,
  ResolutionOptions,
  PlayIntervalOptions,
  PlayChordOptions,
  UsePlaybackReturn,
} from "@/types/audio";

export function usePlayback(_options?: { droneKey?: string }): UsePlaybackReturn {
  const { ensureStarted } = useAudioContext();
  const engineRef = useRef<PlaybackEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new PlaybackEngine();
    }
    return engineRef.current;
  }, []);

  const playDegree = useCallback(
    async (opts: PlayDegreeOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      await getEngine().playDegree(opts);
      setIsPlaying(false);
    },
    [ensureStarted, getEngine],
  );

  const playDegreeSequence = useCallback(
    async (degrees: DiatonicDegree[], opts: Omit<PlayDegreeOptions, "degree">) => {
      await ensureStarted();
      setIsPlaying(true);
      await getEngine().playDegreeSequence(degrees, opts);
      setIsPlaying(false);
    },
    [ensureStarted, getEngine],
  );

  const playResolution = useCallback(
    async (opts: ResolutionOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      await getEngine().playResolution(opts);
      setIsPlaying(false);
    },
    [ensureStarted, getEngine],
  );

  const playInterval = useCallback(
    async (opts: PlayIntervalOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      await getEngine().playInterval(opts);
      setIsPlaying(false);
    },
    [ensureStarted, getEngine],
  );

  const playChord = useCallback(
    async (opts: PlayChordOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      await getEngine().playChord(opts);
      setIsPlaying(false);
    },
    [ensureStarted, getEngine],
  );

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return { playDegree, playDegreeSequence, playResolution, playInterval, playChord, stop, isPlaying };
}

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

export function usePlayback(_options?: {
  droneKey?: string;
}): UsePlaybackReturn {
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
      try {
        await getEngine().playDegree(opts);
      } finally {
        setIsPlaying(false);
      }
    },
    [ensureStarted, getEngine],
  );

  const playDegreeSequence = useCallback(
    async (
      degrees: DiatonicDegree[],
      opts: Omit<PlayDegreeOptions, "degree">,
    ) => {
      await ensureStarted();
      setIsPlaying(true);
      try {
        await getEngine().playDegreeSequence(degrees, opts);
      } finally {
        setIsPlaying(false);
      }
    },
    [ensureStarted, getEngine],
  );

  const playResolution = useCallback(
    async (opts: ResolutionOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      try {
        await getEngine().playResolution(opts);
      } finally {
        setIsPlaying(false);
      }
    },
    [ensureStarted, getEngine],
  );

  const playInterval = useCallback(
    async (opts: PlayIntervalOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      try {
        await getEngine().playInterval(opts);
      } finally {
        setIsPlaying(false);
      }
    },
    [ensureStarted, getEngine],
  );

  const playChord = useCallback(
    async (opts: PlayChordOptions) => {
      await ensureStarted();
      setIsPlaying(true);
      try {
        await getEngine().playChord(opts);
      } finally {
        setIsPlaying(false);
      }
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

  return {
    playDegree,
    playDegreeSequence,
    playResolution,
    playInterval,
    playChord,
    stop,
    isPlaying,
  };
}

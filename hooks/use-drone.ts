"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/components/audio-provider";
import { DroneGenerator } from "@/lib/audio/drone";
import type { NoteName, DroneOptions, CadenceOptions, UseDroneReturn } from "@/types/audio";

export function useDrone(options?: {
  key?: NoteName;
  octave?: number;
  volume?: number;
}): UseDroneReturn {
  const { ensureStarted } = useAudioContext();
  const droneRef = useRef<DroneGenerator | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentKey, setCurrentKey] = useState<NoteName | null>(null);

  // Lazy-init the generator
  const getDrone = useCallback(() => {
    if (!droneRef.current) {
      droneRef.current = new DroneGenerator();
    }
    return droneRef.current;
  }, []);

  const start = useCallback(
    async (opts: DroneOptions) => {
      await ensureStarted();
      const drone = getDrone();
      await drone.start(opts);
      setIsPlaying(true);
      setCurrentKey(opts.key);
    },
    [ensureStarted, getDrone],
  );

  const stop = useCallback(() => {
    droneRef.current?.stop();
    setIsPlaying(false);
    setCurrentKey(null);
  }, []);

  const changeKey = useCallback(
    async (key: NoteName) => {
      await ensureStarted();
      const drone = getDrone();
      await drone.changeKey(key, options?.octave ?? 4);
      setCurrentKey(key);
    },
    [ensureStarted, getDrone, options?.octave],
  );

  const playCadence = useCallback(
    async (cadenceOpts?: Partial<CadenceOptions>) => {
      await ensureStarted();
      const drone = getDrone();
      await drone.playCadence(cadenceOpts);
    },
    [ensureStarted, getDrone],
  );

  // Update volume reactively
  useEffect(() => {
    if (options?.volume !== undefined) {
      droneRef.current?.setVolume(options.volume);
    }
  }, [options?.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      droneRef.current?.dispose();
      droneRef.current = null;
    };
  }, []);

  return { start, stop, changeKey, playCadence, isPlaying, currentKey };
}

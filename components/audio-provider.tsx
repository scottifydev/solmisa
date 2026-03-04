"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import * as Tone from "tone";

interface AudioContextValue {
  isReady: boolean;
  ensureStarted: () => Promise<void>;
  setMasterVolume: (volume: number) => void;
  suspend: () => Promise<void>;
  resume: () => Promise<void>;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  const ensureStarted = useCallback(async () => {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    setIsReady(true);
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    Tone.getDestination().volume.value = Tone.gainToDb(volume);
  }, []);

  const suspend = useCallback(async () => {
    const raw = Tone.getContext().rawContext as AudioContext;
    await raw.suspend();
  }, []);

  const resume = useCallback(async () => {
    const raw = Tone.getContext().rawContext as AudioContext;
    await raw.resume();
    setIsReady(Tone.getContext().state === "running");
  }, []);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        void suspend();
      } else {
        void resume();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [suspend, resume]);

  return (
    <AudioCtx.Provider
      value={{ isReady, ensureStarted, setMasterVolume, suspend, resume }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudioContext must be used within AudioProvider");
  }
  return ctx;
}

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Schedule the move to the next question, with exactly one pending timer.
 *
 * The drills previously called `setTimeout(advance, ...)` and dropped the
 * handle. Two things went wrong: pressing the visible "Next" button left the
 * old timer running, so it advanced a second time about a second later and
 * skipped the question the user was reading; and the queued callback held a
 * closure over the difficulty at answer time, so changing difficulty while a
 * timer was pending reverted it.
 *
 * `schedule` cancels any pending advance before queuing a new one, `cancel`
 * clears it for manual navigation, and the timer is cleared on unmount.
 */
export function useAutoAdvance(advance: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep the latest callback so a queued advance never runs a stale closure.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (delayMs: number) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        advanceRef.current();
      }, delayMs);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}

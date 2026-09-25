"use client";

import { useCallback, useEffect, useState } from "react";
import { addLinesAction } from "@/lib/pos-actions";
import { enqueue, isSupported, listQueue, queueSize, remove, type NewOutboxEntry } from "./outbox";

/**
 * Connection state and outbox draining for the terminal.
 *
 * navigator.onLine only reports whether the device has a link, not whether the
 * COSTERA server is reachable, so a failed action also flips the terminal into
 * offline mode and a successful one flips it back.
 */
export function useOutbox() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!isSupported()) return;
    try {
      setPending(await queueSize());
    } catch {
      // A private window can refuse IndexedDB. The terminal still works online.
    }
  }, []);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    // Scheduled rather than set inline: the first paint must match what the
    // server rendered, and a synchronous setState here costs an extra pass.
    const initial = setTimeout(() => {
      setOnline(navigator.onLine);
      void refreshCount();
    }, 0);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [refreshCount]);

  const queue = useCallback(
    async (entry: NewOutboxEntry) => {
      if (!isSupported()) return false;
      try {
        await enqueue(entry);
        await refreshCount();
        return true;
      } catch {
        return false;
      }
    },
    [refreshCount],
  );

  /**
   * Replay the queue oldest first, stopping at the first entry that will not go
   * through: the ones behind it may depend on it, and a gap in the middle of a
   * ticket is worse than a delay.
   */
  const flush = useCallback(async (): Promise<number> => {
    if (!isSupported()) return 0;

    let sent = 0;
    let entries: Awaited<ReturnType<typeof listQueue>>;
    try {
      entries = await listQueue();
    } catch {
      return 0;
    }

    for (const entry of entries) {
      try {
        const result = await addLinesAction(entry.payload);
        if (!result.ok) {
          // A rejection is the server's verdict, not a network problem: the
          // ticket may have been closed meanwhile. Drop it rather than looping.
          await remove(entry.id);
          continue;
        }
        await remove(entry.id);
        sent++;
      } catch {
        setOnline(false);
        break;
      }
    }

    await refreshCount();
    if (sent > 0) setOnline(true);
    return sent;
  }, [refreshCount]);

  useEffect(() => {
    if (!online || pending === 0) return;
    const drain = setTimeout(() => void flush(), 0);
    return () => clearTimeout(drain);
  }, [online, pending, flush]);

  return { online, pending, queue, flush, setOnline };
}

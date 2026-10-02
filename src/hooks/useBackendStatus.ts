import { useEffect, useState } from "react";

import { checkHealth } from "../api/client";
import type { BackendStatus } from "../types";

const ATTEMPTS = 20;
const DELAY_MS = 3000;

/** Pings /health on load. This also wakes a backend that has gone to sleep. */
export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < ATTEMPTS && !cancelled; attempt += 1) {
        if (await checkHealth()) {
          if (!cancelled) setStatus("ready");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
      if (!cancelled) setStatus("unreachable");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

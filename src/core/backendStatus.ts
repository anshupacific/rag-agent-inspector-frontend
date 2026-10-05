/** Is the backend awake? Checked once when the page loads. */

import { useEffect, useState } from "react";

import { API_BASE_URL } from "./config";

export type BackendStatus = "checking" | "ready" | "unreachable";

const ATTEMPTS = 20;
const DELAY_MS = 3000;

export async function checkHealth(baseUrl = API_BASE_URL): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

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

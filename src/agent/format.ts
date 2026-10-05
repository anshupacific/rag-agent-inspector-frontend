/** Display helpers for the agent's answer and steps. */

import { plural } from "../core/format";
import type { Step } from "./types";

/** Remove raw citation markers (【6:0†source】) from text that is still streaming. */
export function stripMarkers(text: string): string {
  return text.replace(/【[^】]*】/g, "").replace(/【[^】]*$/, "");
}

/** Plain-language line for each kind of step the agent reports. */
export function describeStep(step: Step): string {
  const running = step.status === "started";
  switch (step.type) {
    case "mcp_list_tools":
      return running ? "Looking up the tools it can use" : "Found the knowledge base tool";
    case "reasoning":
      return running ? "Thinking" : "Thought about what to do next";
    case "mcp_call":
      if (running) return "Searching the knowledge base";
      if (step.failed) return "The knowledge base search failed";
      return `Searched the knowledge base and got ${plural(step.chunks ?? 0, "passage")}`;
    case "message":
      return running ? "Writing the answer" : "Wrote the answer";
    default:
      return running ? "Working" : "Finished a step";
  }
}

/** Technical name shown next to the description. */
export function stepName(step: Step): string {
  return step.type === "mcp_call" && step.name ? `mcp_call ${step.name}` : step.type;
}

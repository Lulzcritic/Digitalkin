import type { Agent } from "../models/types.js";

export function generateReply(agent: Agent, userText: string): string {
  const mode = agent.rules?.mode ?? "keyword";
  if (mode === "echo") return `[${agent.name}] ${userText}`;

  const map = agent.rules?.keywords ?? {};
  for (const [kw, resp] of Object.entries(map)) {
    if (userText.toLowerCase().includes(kw.toLowerCase())) return resp;
  }
  return agent.rules?.fallback ?? `Bonjour, je suis ${agent.name}.`;
}

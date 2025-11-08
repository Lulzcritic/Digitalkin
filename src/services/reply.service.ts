import type { Agent } from "../models/types.js";

function pickResponse(value: string | string[]): string {
  return Array.isArray(value)
    ? value[Math.floor(Math.random() * value.length)]!
    : value;
}

export function generateReply(agent: Agent, userText: string): string {
  const mode = agent.rules?.mode ?? "keyword";
  if (mode === "echo") return `[${agent.name}] ${userText}`;

  const map = agent.rules?.keywords ?? {};
  const lower = userText.toLowerCase();

  for (const [kw, candidate] of Object.entries(map)) {
    if (lower.includes(kw.toLowerCase())) return pickResponse(candidate as any);
  }
  return agent.rules?.fallback ?? `Bonjour, je suis ${agent.name}.`;
}

import type { Agent } from "../models/types.js";

function pickResponse(value: string | string[]): string {
  return Array.isArray(value)
    ? value[Math.floor(Math.random() * value.length)]!
    : value;
}

export function generateReply(agent: Agent, userText: string): string {
  const mode = agent.rules?.mode ?? "keyword";

  // Mode echo
  if (mode === "echo") {
    return `[${agent.name}] ${userText}`;
  }

  // Mode keyword 
  if (mode === "keyword") {
    const map = agent.rules?.keywords ?? {};
    const lower = userText.toLowerCase();

    for (const [kw, candidate] of Object.entries(map)) {
      if (lower.includes(kw.toLowerCase())) {
        return pickResponse(candidate as string | string[]);
      }
    }
    return agent.rules?.fallback ?? `Bonjour, je suis ${agent.name}.`;
  }

  // Mode canned
  if (mode === "canned") {
    const replies = agent.rules?.canned ?? [
      "Bonjour !",
      "Comment puis-je vous aider ?",
      "Je suis là pour discuter avec vous !",
    ];
    return pickResponse(replies);
  }
  return agent.rules?.fallback ?? `Bonjour, je suis ${agent.name}.`;
}

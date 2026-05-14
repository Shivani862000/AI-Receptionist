import { Injectable } from "@nestjs/common";

import type { SessionMemoryItem } from "../interfaces/live-session.interface";

@Injectable()
export class ConversationMemoryService {
  append(memory: SessionMemoryItem[], item: SessionMemoryItem, maxItems = 12) {
    const next = [...memory, item];
    return next.length <= maxItems ? next : next.slice(next.length - maxItems);
  }

  buildPrompt(memory: SessionMemoryItem[], latestCallerText: string, businessName?: string | null) {
    const history = memory
      .slice(-8)
      .map((item) => `${item.role.toUpperCase()}: ${item.text}`)
      .join("\n");

    return [
      "You are a live AI receptionist speaking with a customer in real time.",
      "Keep replies short, helpful, and natural for spoken conversation.",
      "Ask one question at a time when clarification is needed.",
      `Business: ${businessName ?? "Local business"}`,
      history ? `Conversation history:\n${history}` : "Conversation history: none yet.",
      `Latest caller message: ${latestCallerText}`,
      "Return only the spoken reply text."
    ].join("\n\n");
  }
}

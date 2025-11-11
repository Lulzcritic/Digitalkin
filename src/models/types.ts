export type Agent = {
    id: string;
    name: string;
    description?: string;
    persona?: string;
    rules?: {
      keywords?: Record<string, string>;
      fallback?: string;
      canned?: string[];
      mode?: "echo" | "keyword" | "canned";
    };
    createdAt: string;
    updatedAt: string;
  };
  
  export type Conversation = {
    id: string;
    agentId: string;
    status: "open" | "closed";
    createdAt: string;
    updatedAt: string;
  };
  
  export type Message = {
    id: string;
    conversationId: string;
    role: "user" | "agent" | "system";
    content: string;
    timestamp: string;
  };
  